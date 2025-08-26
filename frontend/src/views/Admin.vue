<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-icon class="mr-3" size="32">mdi-cog</v-icon>
          <div>
            <h1 class="text-h4">Administration</h1>
            <p class="text-subtitle-1 text-grey mb-0">Gérez les utilisateurs, groupes et permissions</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6">
      <v-tab value="users">
        <v-icon class="mr-2">mdi-account-group</v-icon>
        Utilisateurs
      </v-tab>
      <v-tab value="groups">
        <v-icon class="mr-2">mdi-account-multiple</v-icon>
        Groupes
      </v-tab>
      <v-tab value="folders">
        <v-icon class="mr-2">mdi-folder-multiple</v-icon>
        Structure
      </v-tab>
    </v-tabs>

    <!-- Users Tab -->
    <v-window v-model="activeTab">
      <v-window-item value="users">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Gestion des utilisateurs</span>
            <v-btn color="primary" prepend-icon="mdi-account-plus" @click="$router.push('/admin/register')">
              Créer un utilisateur
            </v-btn>
          </v-card-title>

          <v-card-text>
            <!-- eslint-disable vue/valid-v-slot -->
            <v-data-table
              :headers="userHeaders"
              :items="users"
              :loading="usersLoading"
              item-value="id"
            >
              <template #item.status="{ item }">
                <v-chip
                  :color="item.isActive ? 'success' : 'error'"
                  variant="flat"
                  size="small"
                >
                  {{ item.isActive ? 'Actif' : 'Inactif' }}
                </v-chip>
              </template>

              <template #item.role="{ item }">
                <v-chip
                  :color="item.isAdmin ? 'red' : 'primary'"
                  variant="flat"
                  size="small"
                >
                  {{ item.isAdmin ? 'Admin' : 'Utilisateur' }}
                </v-chip>
              </template>

              <template #item.lastLoginAt="{ item }">
                {{ item.lastLoginAt ? formatDate(item.lastLoginAt) : 'Jamais' }}
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  @click="editUser(item)"
                ></v-btn>
                <v-btn
                  :icon="item.isActive ? 'mdi-account-cancel' : 'mdi-account-check'"
                  variant="text"
                  size="small"
                  :color="item.isActive ? 'error' : 'success'"
                  @click="toggleUserStatus(item)"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteUser(item)"
                  :disabled="item.isAdmin"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Groups Tab -->
      <v-window-item value="groups">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Gestion des groupes</span>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="showCreateGroupDialog = true">
              Créer un groupe
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="groupHeaders"
              :items="groups"
              :loading="groupsLoading"
              item-value="id"
            >
              <template #item.memberCount="{ item }">
                {{ item.memberCount || 0 }} membre(s)
              </template>

              <template #item.createdAt="{ item }">
                {{ formatDate(item.createdAt) }}
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  icon="mdi-account-group"
                  variant="text"
                  size="small"
                  @click="manageGroupMembers(item)"
                ></v-btn>
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  @click="editGroup(item)"
                ></v-btn>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="deleteGroup(item)"
                ></v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <!-- Folders Tab -->
      <v-window-item value="folders">
        <v-card>
          <v-card-title>Structure des dossiers</v-card-title>
          <v-card-text>
            <v-alert type="info" class="mb-4">
              Gérez la structure hiérarchique des dossiers et leurs permissions.
            </v-alert>

            <v-treeview
              :items="folderStructure"
              item-title="name"
              item-value="id"
              open-strategy="multiple"
            >
              <template v-slot:prepend="{ item }">
                <v-icon>{{ item.type === 'folder' ? 'mdi-folder' : 'mdi-file-document' }}</v-icon>
              </template>

              <template v-slot:append="{ item }">
                <v-btn
                  icon="mdi-cog"
                  variant="text"
                  size="small"
                  @click="manageFolderPermissions(item)"
                ></v-btn>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Create Group Dialog -->
    <v-dialog v-model="showCreateGroupDialog" max-width="400">
      <v-card>
        <v-card-title>Créer un nouveau groupe</v-card-title>
        <v-card-text>
          <v-form ref="groupForm">
            <v-text-field
              v-model="newGroup.name"
              label="Nom du groupe"
              variant="outlined"
              :rules="nameRules"
              class="mb-3"
            ></v-text-field>
            <v-textarea
              v-model="newGroup.description"
              label="Description"
              variant="outlined"
              rows="3"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showCreateGroupDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="createGroup">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit User Dialog -->
    <v-dialog v-model="showEditUserDialog" max-width="500">
      <v-card>
        <v-card-title>Modifier l'utilisateur</v-card-title>
        <v-card-text>
          <v-form ref="editUserForm">
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="editingUser.firstName"
                  label="Prénom"
                  variant="outlined"
                  :rules="nameRules"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editingUser.lastName"
                  label="Nom"
                  variant="outlined"
                  :rules="nameRules"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-model="editingUser.email"
              label="Email"
              variant="outlined"
              :rules="emailRules"
              disabled
            ></v-text-field>
            <v-switch
              v-model="editingUser.isAdmin"
              label="Administrateur"
              color="red"
            ></v-switch>
            <v-switch
              v-model="editingUser.isActive"
              label="Compte actif"
              color="success"
            ></v-switch>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showEditUserDialog = false">Annuler</v-btn>
          <v-btn color="primary" @click="saveUser">Sauvegarder</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Admin',
  setup () {
    const route = useRoute()
    const toast = useToast()

    const activeTab = ref('users')
    const usersLoading = ref(false)
    const groupsLoading = ref(false)
    const showCreateGroupDialog = ref(false)
    const showEditUserDialog = ref(false)
    const groupForm = ref(null)
    const editUserForm = ref(null)

    const newGroup = reactive({
      name: '',
      description: ''
    })

    const editingUser = reactive({
      id: null,
      firstName: '',
      lastName: '',
      email: '',
      isAdmin: false,
      isActive: true
    })

    // Mock data - in real app this would come from API
    const users = ref([
      {
        id: 1,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        isAdmin: true,
        isActive: true,
        lastLoginAt: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isAdmin: false,
        isActive: true,
        lastLoginAt: '2024-01-14T15:20:00Z',
        createdAt: '2024-01-05T09:00:00Z'
      },
      {
        id: 3,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        isAdmin: false,
        isActive: false,
        lastLoginAt: null,
        createdAt: '2024-01-10T14:30:00Z'
      }
    ])

    const groups = ref([
      {
        id: 1,
        name: 'Développeurs',
        description: 'Équipe de développement',
        memberCount: 2,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Rédacteurs',
        description: 'Équipe de rédaction de contenu',
        memberCount: 1,
        createdAt: '2024-01-05T00:00:00Z'
      }
    ])

    const folderStructure = ref([
      {
        id: 1,
        name: 'Documentation',
        type: 'folder',
        children: [
          { id: 11, name: 'API', type: 'folder' },
          { id: 12, name: 'Guide utilisateur', type: 'document' }
        ]
      },
      {
        id: 2,
        name: 'Projets',
        type: 'folder',
        children: [
          { id: 21, name: 'Projet A', type: 'folder' },
          { id: 22, name: 'Projet B', type: 'folder' }
        ]
      }
    ])

    const userHeaders = [
      { title: 'Nom', key: 'lastName', sortable: true },
      { title: 'Prénom', key: 'firstName', sortable: true },
      { title: 'Email', key: 'email', sortable: true },
      { title: 'Rôle', key: 'role', sortable: false },
      { title: 'Statut', key: 'status', sortable: false },
      { title: 'Dernière connexion', key: 'lastLoginAt', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
    ]

    const groupHeaders = [
      { title: 'Nom', key: 'name', sortable: true },
      { title: 'Description', key: 'description', sortable: false },
      { title: 'Membres', key: 'memberCount', sortable: true },
      { title: 'Créé le', key: 'createdAt', sortable: true },
      { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
    ]

    const nameRules = [
      v => !!v || 'Ce champ est requis',
      v => (v && v.length >= 2) || 'Le nom doit contenir au moins 2 caractères'
    ]

    const emailRules = [
      v => !!v || 'L\'email est requis',
      v => /.+@.+\..+/.test(v) || 'L\'email doit être valide'
    ]

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const editUser = (user) => {
      Object.assign(editingUser, user)
      showEditUserDialog.value = true
    }

    const saveUser = async () => {
      const { valid } = await editUserForm.value.validate()
      if (!valid) return

      const index = users.value.findIndex(u => u.id === editingUser.id)
      if (index > -1) {
        Object.assign(users.value[index], editingUser)
        toast.success('Utilisateur mis à jour avec succès')
        showEditUserDialog.value = false
      }
    }

    const toggleUserStatus = (user) => {
      user.isActive = !user.isActive
      toast.success(`Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`)
    }

    const deleteUser = (user) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstName} ${user.lastName} ?`)) {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index > -1) {
          users.value.splice(index, 1)
          toast.success('Utilisateur supprimé avec succès')
        }
      }
    }

    const createGroup = async () => {
      const { valid } = await groupForm.value.validate()
      if (!valid) return

      const newGroupObj = {
        id: Date.now(),
        name: newGroup.name,
        description: newGroup.description,
        memberCount: 0,
        createdAt: new Date().toISOString()
      }

      groups.value.push(newGroupObj)
      toast.success('Groupe créé avec succès')

      newGroup.name = ''
      newGroup.description = ''
      showCreateGroupDialog.value = false
    }

    const editGroup = (group) => {
      toast.info('Édition des groupes en cours de développement')
    }

    const manageGroupMembers = (group) => {
      toast.info('Gestion des membres en cours de développement')
    }

    const deleteGroup = (group) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer le groupe "${group.name}" ?`)) {
        const index = groups.value.findIndex(g => g.id === group.id)
        if (index > -1) {
          groups.value.splice(index, 1)
          toast.success('Groupe supprimé avec succès')
        }
      }
    }

    const manageFolderPermissions = (folder) => {
      toast.info('Gestion des permissions en cours de développement')
    }

    onMounted(() => {
      // Set active tab from query parameter
      if (route.query.tab) {
        activeTab.value = route.query.tab
      }
    })

    return {
      activeTab,
      usersLoading,
      groupsLoading,
      showCreateGroupDialog,
      showEditUserDialog,
      groupForm,
      editUserForm,
      newGroup,
      editingUser,
      users,
      groups,
      folderStructure,
      userHeaders,
      groupHeaders,
      nameRules,
      emailRules,
      formatDate,
      editUser,
      saveUser,
      toggleUserStatus,
      deleteUser,
      createGroup,
      editGroup,
      manageGroupMembers,
      deleteGroup,
      manageFolderPermissions
    }
  }
}
</script>
