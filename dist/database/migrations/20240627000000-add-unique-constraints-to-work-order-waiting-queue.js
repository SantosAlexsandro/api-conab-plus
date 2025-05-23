"use strict";module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addConstraint('work_order_waiting_queue', {
      fields: ['ura_request_id'],
      type: 'unique',
      name: 'unique_ura_request_id'
    });

    await queryInterface.addConstraint('work_order_waiting_queue', {
      fields: ['order_number'],
      type: 'unique',
      name: 'unique_order_number'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('work_order_waiting_queue', 'unique_ura_request_id');
    await queryInterface.removeConstraint('work_order_waiting_queue', 'unique_order_number');
  },
};
