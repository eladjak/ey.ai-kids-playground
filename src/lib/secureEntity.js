import { User } from "@/entities/User";

/**
 * Creates a secure wrapper around a Base44 entity that adds
 * authentication and ownership validation.
 *
 * Base44 has no server-side RLS, so all auth/ownership checks must
 * happen client-side. This wrapper enforces those checks for write
 * operations (create, update, delete) while passing reads through.
 *
 * @param {object} entity  - A Base44 entity object (e.g. base44.entities.Book)
 * @param {object} options
 * @param {string} [options.ownerField='created_by'] - Field used to store the owner identifier
 * @returns {object} Secure entity wrapper
 */
export function createSecureEntity(entity, options = {}) {
  const { ownerField = 'created_by' } = options;

  return {
    // --- Pass-through read operations ---

    list: (filters, sort, limit, offset) =>
      entity.list ? entity.list(filters, sort, limit, offset) : entity.filter(filters, sort, limit, offset),

    filter: (filters, sort, limit, offset) =>
      entity.filter(filters, sort, limit, offset),

    get: (id) => entity.get(id),

    // --- Secured write operations ---

    create: async (data) => {
      const user = await User.me();
      if (!user?.email) throw new Error('Authentication required');
      return entity.create({ ...data, [ownerField]: user.email });
    },

    update: async (id, data) => {
      const user = await User.me();
      if (!user?.email) throw new Error('Authentication required');

      const existing = await entity.get(id);
      if (existing[ownerField] && existing[ownerField] !== user.email) {
        throw new Error('Not authorized to modify this resource');
      }

      return entity.update(id, data);
    },

    delete: async (id) => {
      const user = await User.me();
      if (!user?.email) throw new Error('Authentication required');

      const existing = await entity.get(id);
      if (existing[ownerField] && existing[ownerField] !== user.email) {
        throw new Error('Not authorized to delete this resource');
      }

      return entity.delete(id);
    },
  };
}
