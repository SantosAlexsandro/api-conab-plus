import Sequelize, { Model } from 'sequelize';

export default class WorkShift extends Model {
  static init(sequelize) {
    super.init(
      {
        status: {
          type: Sequelize.ENUM('Ativo', 'Inativo'),
          defaultValue: 'Ativo',
          validate: {
            isIn: [['Ativo', 'Inativo']],
          },
        },
        start_time: {
          type: Sequelize.DATE,
          validate: {
            isDate: {
              msg: 'Data de início inválida',
            },
          },
        },
        end_time: {
          type: Sequelize.DATE,
          validate: {
            isDate: {
              msg: 'Data de término inválida',
            },
          },
        },
        technician_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            isInt: {
              msg: 'O ID do técnico deve ser um número inteiro',
            },
          },
        },
      },
      {
        sequelize,
        tableName: 'work_shifts',
      }
    );

    return this;
  }
}
