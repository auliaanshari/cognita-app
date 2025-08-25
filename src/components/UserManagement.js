// src/components/UserManagement.js
'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AddUserModal from './AddUserModal';
import UserTableSkeleton from './skeletons/UserTableSkeleton';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError('Gagal memuat data pengguna.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserAdded = (newUser) => {
    setUsers([...users, newUser]);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      toast.success('Peran pengguna berhasil diubah!');
    } catch (err) {
      toast.error('Gagal mengubah peran pengguna.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        'Apakah Anda yakin ingin menghapus pengguna ini secara permanen?'
      )
    ) {
      try {
        await api.delete(`/users/${userId}`);
        setUsers(users.filter((user) => user._id !== userId));
        toast.success('Pengguna berhasil dihapus.');
      } catch (err) {
        toast.error('Gagal menghapus pengguna.');
      }
    }
  };

  if (isLoading) return <UserTableSkeleton />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-2">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Manajemen Pengguna</CardTitle>
            <CardDescription className="mt-1">
              Lihat, edit peran, atau hapus pengguna dari sistem.
            </CardDescription>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            + Tambah Pengguna
          </Button>
        </div>
      </CardHeader>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Peran</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(newRole) =>
                      handleRoleChange(user._id, newRole)
                    }
                    disabled={user.email === 'admin@gmail.com'}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentee">Mentee</SelectItem>
                      <SelectItem value="mentor">Mentor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  {user.email !== 'admin@gmail.com' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Hapus
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserAdded={handleUserAdded}
      />
    </div>
  );
}
