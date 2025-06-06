// Removido import do logEvent para usar console.log/error diretamente

// Formata mensagem HTML para Teams
export const formatHTMLMessage = (message, options = {}) => {
  const { bold = false, italic = false, color = null, size = null } = options;

  let formattedMessage = message;

  if (bold) {
    formattedMessage = `<strong>${formattedMessage}</strong>`;
  }

  if (italic) {
    formattedMessage = `<em>${formattedMessage}</em>`;
  }

  if (color) {
    formattedMessage = `<span style="color: ${color}">${formattedMessage}</span>`;
  }

  if (size) {
    formattedMessage = `<span style="font-size: ${size}">${formattedMessage}</span>`;
  }

  return formattedMessage;
};

// Cria mensagem de notificação formatada
export const createNotificationMessage = (type, title, description, actionUrl = null) => {
  const typeIcons = {
    info: '🔔',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    task: '📋',
    meeting: '📅',
    reminder: '⏰'
  };

  const icon = typeIcons[type] || '🔔';
  let message = `${icon} **${title}**\n\n${description}`;

  if (actionUrl) {
    message += `\n\n[Clique aqui para mais detalhes](${actionUrl})`;
  }

  return message;
};

// Valida formato de email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Valida participantes para criação de chat
export const validateChatParticipants = (participants) => {
  if (!Array.isArray(participants) || participants.length === 0) {
    return { valid: false, error: 'Participantes deve ser um array não vazio' };
  }

  for (const participant of participants) {
    if (!participant.email && !participant.id) {
      return { valid: false, error: 'Cada participante deve ter email ou id' };
    }

    if (participant.email && !isValidEmail(participant.email)) {
      return { valid: false, error: `Email inválido: ${participant.email}` };
    }
  }

  return { valid: true };
};

// Converte status de presença para português
export const translatePresenceStatus = (availability, activity) => {
  const availabilityTranslations = {
    'Available': 'Disponível',
    'Busy': 'Ocupado',
    'DoNotDisturb': 'Não Perturbe',
    'BeRightBack': 'Volto Logo',
    'Away': 'Ausente',
    'Offline': 'Offline'
  };

  const activityTranslations = {
    'Available': 'Disponível',
    'InACall': 'Em Chamada',
    'InAConferenceCall': 'Em Conferência',
    'InAMeeting': 'Em Reunião',
    'Busy': 'Ocupado',
    'Presenting': 'Apresentando'
  };

  return {
    availability: availabilityTranslations[availability] || availability,
    activity: activityTranslations[activity] || activity
  };
};

// Cria payload para notificação de ordem de serviço
export const createWorkOrderNotification = (workOrder, recipientId) => {
  return {
    topic: `Ordem de Serviço #${workOrder.number}`,
    activityType: 'workOrderAssigned',
    previewText: `Nova ordem de serviço atribuída: ${workOrder.title}`,
    templateParameters: {
      workOrderNumber: workOrder.number,
      workOrderTitle: workOrder.title,
      priority: workOrder.priority,
      dueDate: workOrder.dueDate,
      assignedTechnician: workOrder.assignedTo,
      customer: workOrder.customer,
      actionUrl: `${process.env.APP_URL}/work-orders/${workOrder.id}`
    }
  };
};

// Cria payload para notificação de lembrete
export const createReminderNotification = (reminder, recipientId) => {
  return {
    topic: `Lembrete: ${reminder.title}`,
    activityType: 'reminder',
    previewText: reminder.description,
    templateParameters: {
      reminderTitle: reminder.title,
      reminderDescription: reminder.description,
      reminderTime: reminder.scheduledTime,
      actionUrl: reminder.actionUrl
    }
  };
};

// Formata data para exibição em mensagens
export const formatDateForMessage = (date, includeTime = true) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Date(date).toLocaleDateString('pt-BR', options);
};

// Sanitiza texto para prevenir injeção
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';

  return text
    .replace(/[<>]/g, '') // Remove caracteres perigosos
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Cria mensagem de erro padronizada
export const createErrorMessage = (error, context = '') => {
      console.error(`[TeamsHelpers] ${context}: ${error.message}`);

  return {
    message: 'Ops! Algo deu errado 😕',
    description: 'Ocorreu um erro ao processar sua solicitação. Nossa equipe foi notificada.',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  };
};

// Valida configurações do Teams
export const validateTeamsConfig = () => {
  const requiredEnvVars = [
    'TEAMS_CLIENT_ID',
    'TEAMS_CLIENT_SECRET',
    'TEAMS_TENANT_ID',
    'TEAMS_REDIRECT_URI'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    const error = `Variáveis de ambiente do Teams não configuradas: ${missingVars.join(', ')}`;
    console.error('[TeamsHelpers]', error);
    return { valid: false, error };
  }

  return { valid: true };
};

// Cria URL de deep link para Teams
export const createTeamsDeepLink = (chatId, message = null) => {
  let deepLink = `https://teams.microsoft.com/l/chat/0/0?users=${chatId}`;

  if (message) {
    deepLink += `&message=${encodeURIComponent(message)}`;
  }

  return deepLink;
};

// Extrai menções de uma mensagem
export const extractMentions = (messageContent) => {
  const mentionRegex = /@<at[^>]*>([^<]+)<\/at>/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(messageContent)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

// Cria adaptive card básico
export const createAdaptiveCard = (title, subtitle, body, actions = []) => {
  return {
    type: 'AdaptiveCard',
    version: '1.4',
    body: [
      {
        type: 'TextBlock',
        text: title,
        weight: 'bolder',
        size: 'medium'
      },
      ...(subtitle ? [{
        type: 'TextBlock',
        text: subtitle,
        isSubtle: true
      }] : []),
      {
        type: 'TextBlock',
        text: body,
        wrap: true
      }
    ],
    actions: actions
  };
};
