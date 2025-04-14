"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class WorkShift extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        status: {
          type: _sequelize2.default.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
          validate: {
            isIn: [['ACTIVE', 'INACTIVE']],
          },
        },
        start_time: {
          type: _sequelize2.default.DATE,
          validate: {
            isDate: {
              msg: 'Data de início inválida',
            },
          },
        },
        end_time: {
          type: _sequelize2.default.DATE,
          validate: {
            isDate: {
              msg: 'Data de término inválida',
            },
          },
        },
        user_code: {
          type: _sequelize2.default.STRING,
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
} exports.default = WorkShift;
