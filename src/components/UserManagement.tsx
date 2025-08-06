import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search,
  Mail,
  Shield,
  Calendar
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  created_at: string;
}

export const UserManagement = () => {
  const { role: currentUserRole, getRoleDisplayName } = useUserRole();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'employee' as UserRole
  });

  const roles: UserRole[] = ['employee', 'product_expert', 'tech_expert', 'leader', 'super_admin', 'idealabs_core_team', 'idea_mentor'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch users"
        });
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserRole === 'super_admin') {
      fetchUsers();
    }
  }, [currentUserRole]);

  const handleAddUser = async () => {
    try {
      if (!newUser.email.endsWith('@ideas2it.com')) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Only ideas2it.com email addresses are allowed"
        });
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            first_name: newUser.firstName,
            last_name: newUser.lastName
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
        return;
      }

      if (data.user) {
        // Update the user's role if different from default
        if (newUser.role !== 'employee') {
          const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: newUser.role })
            .eq('id', data.user.id);

          if (roleError) {
            console.error('Error updating user role:', roleError);
          }
        }

        toast({
          title: "Success",
          description: "User added successfully"
        });

        setNewUser({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'employee'
        });
        setIsAddDialogOpen(false);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add user"
      });
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          role: selectedUser.role
        })
        .eq('id', selectedUser.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
        return;
      }

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete from auth.users - this will cascade to profiles table
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message
        });
        return;
      }

      toast({
        title: "Success",
        description: "User deleted successfully"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentUserRole !== 'super_admin') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold mb-2">Access Denied</h4>
          <p className="text-muted-foreground text-center">
            Only Super Admins can access user management
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users and their roles in the system
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and assign their role
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john.doe@ideas2it.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users ({users.length})
          </CardTitle>
          <CardDescription>
            All registered users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-medium">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : 'Unknown Name'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog open={isEditDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (!open) setSelectedUser(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                className="gap-2"
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>
                                  Update user information and role
                                </DialogDescription>
                              </DialogHeader>
                              {selectedUser && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="editFirstName">First Name</Label>
                                      <Input
                                        id="editFirstName"
                                        value={selectedUser.first_name || ''}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, first_name: e.target.value })}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="editLastName">Last Name</Label>
                                      <Input
                                        id="editLastName"
                                        value={selectedUser.last_name || ''}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, last_name: e.target.value })}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editEmail">Email</Label>
                                    <Input
                                      id="editEmail"
                                      value={selectedUser.email}
                                      disabled
                                      className="bg-muted"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="editRole">Role</Label>
                                    <Select 
                                      value={selectedUser.role} 
                                      onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value as UserRole })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {roles.map((role) => (
                                          <SelectItem key={role} value={role}>
                                            {getRoleDisplayName(role)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleEditUser}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the user account
                                  and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete User
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No users found</h4>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users match your search criteria' : 'No users have been added yet'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};