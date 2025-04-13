import Sequelize, { Model } from 'sequelize';

export default class WorkShift extends Model {
  static init(sequelize) {
    super.init(
      {
        status: {
          type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
          validate: {
            isIn: [['ACTIVE', 'INACTIVE']],
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
        user_code: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: {
              msg: 'O código do usuário não pode estar vazio',
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
