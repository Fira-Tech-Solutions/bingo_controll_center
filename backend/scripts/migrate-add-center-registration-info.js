/**
 * Migration: Add registration info columns to bingo_centers table.
 *
 * These fields store customer service / registration data:
 * - owner_name: person who owns the bingo center
 * - phone: contact phone number
 * - email: contact email
 * - address: physical address
 * - region: city / region
 * - notes: additional registration notes
 */
'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addColumn('bingo_centers', 'owner_name', {
      type: 'VARCHAR(100)',
      allowNull: true,
    });
    await queryInterface.addColumn('bingo_centers', 'phone', {
      type: 'VARCHAR(20)',
      allowNull: true,
    });
    await queryInterface.addColumn('bingo_centers', 'additional_contact', {
      type: 'VARCHAR(255)',
      allowNull: true,
    });
    await queryInterface.addColumn('bingo_centers', 'address', {
      type: 'VARCHAR(255)',
      allowNull: true,
    });
    await queryInterface.addColumn('bingo_centers', 'region', {
      type: 'VARCHAR(100)',
      allowNull: true,
    });
    await queryInterface.addColumn('bingo_centers', 'notes', {
      type: 'TEXT',
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('bingo_centers', 'owner_name');
    await queryInterface.removeColumn('bingo_centers', 'phone');
    await queryInterface.removeColumn('bingo_centers', 'additional_contact');
    await queryInterface.removeColumn('bingo_centers', 'address');
    await queryInterface.removeColumn('bingo_centers', 'region');
    await queryInterface.removeColumn('bingo_centers', 'notes');
  },
};
