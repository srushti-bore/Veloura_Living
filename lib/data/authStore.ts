/**
 * 🏛️ Veloura Living — Production Auth & Identity Store
 * Backed by UserRepository with PostgreSQL / Supabase source of truth and persistent disk cache.
 * Reference: docs/Veloura_Living_SRS.md
 */

export type { UserRecord, CreateUserInput, GoogleUserProfileInput, SaveUserOptions } from './userRepository';
export {
  initUserRepository as initAuthStore,
  findUserByEmail,
  findUserByEmailAuthoritative,
  findUserById,
  findUserByIdAuthoritative,
  saveUserRecord,
  saveUserRecordAsync,
  UserPersistenceError,
  clearUsersCacheForTesting,
  createUser,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
  checkAccountLockout,
  recordFailedLogin,
  resetFailedLogin,
  createPasswordResetToken,
  consumePasswordResetToken,
  createEmailVerificationToken,
  consumeEmailVerificationToken,
  findOrCreateGoogleUser,
} from './userRepository';
