module.exports = (sequelize, DataTypes) => {
  const PhoneOtpChallenge = sequelize.define(
    'PhoneOtpChallenge',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      phoneE164: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'phone_e164'
      },
      codeHash: {
        type: DataTypes.STRING(128),
        allowNull: false,
        field: 'code_hash'
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'phone_otp_challenges',
      timestamps: true,
      underscored: true
    }
  );

  return PhoneOtpChallenge;
};
