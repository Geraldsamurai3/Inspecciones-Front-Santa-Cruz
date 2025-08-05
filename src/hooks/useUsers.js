import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/usersService';

export function useUsers({ skipFetchOnMount = false } = {}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(!skipFetchOnMount);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!skipFetchOnMount) {
      fetchUsers();
    }
  }, [fetchUsers, skipFetchOnMount]);

  const toggleBlockUser = useCallback(
    async (id) => {
      await usersService.toggleBlock(id);
      await fetchUsers();
    },
    [fetchUsers]
  );

  const deleteUser = useCallback(
    async (id) => {
      await usersService.deleteUser(id);
      await fetchUsers();
    },
    [fetchUsers]
  );

  const updateUser = useCallback(
    async (id, userData) => {
      const { id: _omit, ...body } = userData;
      await usersService.updateUser(id, body);
      await fetchUsers();
    },
    [fetchUsers]
  );

  const forgotPassword = useCallback(async (email) => {
    return await usersService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (token, newPassword) => {
    return await usersService.resetPassword(token, newPassword);
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    toggleBlockUser,
    deleteUser,
    updateUser,
    forgotPassword,
    resetPassword,
  };
}
