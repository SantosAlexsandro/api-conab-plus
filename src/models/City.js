import Sequelize, { Model } from "sequelize";

export default class City extends Model {
  static init(sequelize) {
    super.init(
      {
        city_cod: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        full_name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        acronym_federal_unit: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        ibge_city_cod: {
          type: Sequelize.STRING,
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
}
