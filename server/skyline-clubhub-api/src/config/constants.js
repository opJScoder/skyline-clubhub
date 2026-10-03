const ROLES = Object.freeze({
  MEMBER: 'member',
  VOLUNTEER: 'volunteer',
  TREASURER: 'treasurer',
  ADMIN: 'admin',
});

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };
