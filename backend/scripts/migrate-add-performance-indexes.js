/**
 * Migration: Add performance indexes to recharge_history and bingo_centers tables.
 *
 * These indexes speed up the most common queries:
 * - Center list balance aggregation (GROUP BY bingo_center_username)
 * - Transaction filtering (WHERE debited_by)
 * - Date range queries (WHERE timestamp)
 * - Bonus package usage check (WHERE package_id)
 * - Center filtering by creator (WHERE created_by)
 */
'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addIndex('recharge_history', ['bingo_center_username']);
    await queryInterface.addIndex('recharge_history', ['debited_by']);
    await queryInterface.addIndex('recharge_history', ['timestamp']);
    await queryInterface.addIndex('recharge_history', ['package_id']);
    await queryInterface.addIndex('bingo_centers', ['created_by']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('recharge_history', ['bingo_center_username']);
    await queryInterface.removeIndex('recharge_history', ['debited_by']);
    await queryInterface.removeIndex('recharge_history', ['timestamp']);
    await queryInterface.removeIndex('recharge_history', ['package_id']);
    await queryInterface.removeIndex('bingo_centers', ['created_by']);
  },
};
