"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);

 class City extends _sequelize.Model {
  static init(sequelize) {
    super.init(
      {
        city_cod: {
          type: _sequelize2.default.STRING,
          allowNull: false,
        },
        full_name: {
          type: _sequelize2.default.STRING,
          allowNull: false,
        },
        acronym_federal_unit: {
          type: _sequelize2.default.STRING,
          allowNull: false,
        },
        ibge_city_cod: {
          type: _sequelize2.default.STRING,
          allowNull: false,
          unique: true, // Garante unicidade
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }
} exports.default = City;
