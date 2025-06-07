"use strict";Object.defineProperty(exports, "__esModule", {value: true});// Removido import do logEvent para usar console.log/error diretamente

// Formata mensagem HTML para Teams
 const formatHTMLMessage = (message, options = {}) => {
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
}; exports.formatHTMLMessage = formatHTMLMessage;

// Cria mensagem de notificação formatada
 const createNotificationMessage = (type, title, description, actionUrl = null) => {
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
}; exports.createNotificationMessage = createNotificationMessage;

// Valida formato de email
 const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}; exports.isValidEmail = isValidEmail;

// Valida participantes para criação de chat
 const validateChatParticipants = (participants) => {
  if (!Array.isArray(participants) || participants.length === 0) {
    return { valid: false, error: 'Participantes deve ser um array não vazio' };
  }

  for (const participant of participants) {
    if (!participant.email && !participant.id) {
      return { valid: false, error: 'Cada participante deve ter email ou id' };
    }

    if (participant.email && !exports.isValidEmail.call(void 0, participant.email)) {
      return { valid: false, error: `Email inválido: ${participant.email}` };
    }
  }

  return { valid: true };
}; exports.validateChatParticipants = validateChatParticipants;

// Converte status de presença para português
 const translatePresenceStatus = (availability, activity) => {
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
}; exports.translatePresenceStatus = translatePresenceStatus;

// Cria payload para notificação de ordem de serviço
 const createWorkOrderNotification = (workOrder, recipientId) => {
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
}; exports.createWorkOrderNotification = createWorkOrderNotification;

// Cria payload para notificação de lembrete
 const createReminderNotification = (reminder, recipientId) => {
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
}; exports.createReminderNotification = createReminderNotification;

// Formata data para exibição em mensagens
 const formatDateForMessage = (date, includeTime = true) => {
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
}; exports.formatDateForMessage = formatDateForMessage;

// Sanitiza texto para prevenir injeção
 const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';

  return text
    .replace(/[<>]/g, '') // Remove caracteres perigosos
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}; exports.sanitizeText = sanitizeText;

// Cria mensagem de erro padronizada
 const createErrorMessage = (error, context = '') => {
      console.error(`[TeamsHelpers] ${context}: ${error.message}`);

  return {
    message: 'Ops! Algo deu errado 😕',
    description: 'Ocorreu um erro ao processar sua solicitação. Nossa equipe foi notificada.',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
  };
}; exports.createErrorMessage = createErrorMessage;

// Valida configurações do Teams
 const validateTeamsConfig = () => {
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
}; exports.validateTeamsConfig = validateTeamsConfig;

// Cria URL de deep link para Teams
 const createTeamsDeepLink = (chatId, message = null) => {
  let deepLink = `https://teams.microsoft.com/l/chat/0/0?users=${chatId}`;

  if (message) {
    deepLink += `&message=${encodeURIComponent(message)}`;
  }

  return deepLink;
}; exports.createTeamsDeepLink = createTeamsDeepLink;

// Extrai menções de uma mensagem
 const extractMentions = (messageContent) => {
  const mentionRegex = /@<at[^>]*>([^<]+)<\/at>/g;
  const mentions = [];
  let match;

  while ((match = mentionRegex.exec(messageContent)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}; exports.extractMentions = extractMentions;

// Cria adaptive card básico
 const createAdaptiveCard = (title, subtitle, body, actions = []) => {
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
}; exports.createAdaptiveCard = createAdaptiveCard;
