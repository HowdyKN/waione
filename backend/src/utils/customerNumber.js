const MIN = 1_000_000_000;
const MAX = 9_999_999_999;

function randomTenDigitString() {
  return String(Math.floor(MIN + Math.random() * (MAX - MIN + 1)));
}

/**
 * Generate a unique 10-digit customer number (string) for User rows.
 * @param {import('sequelize').ModelCtor} User
 * @param {number} [maxAttempts=15]
 * @returns {Promise<string>}
 */
async function generateUniqueCustomerNumber(User, maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = randomTenDigitString();
    const existing = await User.findOne({
      where: { customerNumber: candidate },
      attributes: ['id']
    });
    if (!existing) return candidate;
  }
  throw new Error('Could not allocate unique customerNumber');
}

module.exports = {
  randomTenDigitString,
  generateUniqueCustomerNumber
};
