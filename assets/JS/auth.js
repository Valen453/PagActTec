// assets/JS/auth.js
const USERS_STORAGE_KEY = 'siteUsers';
const SESSION_STORAGE_KEY = 'currentUserSession';

function getUsers() {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

(function initializeAdmin() {
    let users = getUsers();
    if (users.filter(u => u.role === 'admin').length === 0) {
        users.push({
            id: 'admin_' + Date.now(),
            username: 'admin',
            password: 'admin', 
            nombre: 'Administrator',
            dni: 'N/A', 
            role: 'admin'
        });
        saveUsers(users);
    }
})();

function registerUser(username, password, nombre, dni) {
    let users = getUsers();
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'El nombre de usuario ya existe.' };
    }
    users.push({ id: 'user_' + Date.now(), username, password, nombre, dni, role: 'user' });
    saveUsers(users);
    return { success: true, message: '¡Registro exitoso! Ahora puedes iniciar sesión.' };
}

function login(username, password) {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password); 
    if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ username: user.username, role: user.role, id: user.id, nombre: user.nombre }));
        return { success: true, role: user.role, nombre: user.nombre };
    }
    return { success: false, message: 'Nombre de usuario o contraseña inválidos.' };
}

function logout() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.href = 'index.html'; 
}

function getCurrentUser() {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    try {
        return session ? JSON.parse(session) : null;
    } catch (e) {
        console.error("Error al parsear sesión de usuario:", e);
        localStorage.removeItem(SESSION_STORAGE_KEY); // Limpiar sesión corrupta
        return null;
    }
}

function isAdminLoggedIn() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.role === 'admin';
}

function getAllUsersForAdminView() {
    if (!isAdminLoggedIn()) return [];
    return getUsers();
}

function deleteUserAsAdmin(userIdToDelete) {
    if (!isAdminLoggedIn()) return { success: false, message: "No autorizado." };
    let users = getUsers();
    const loggedInAdmin = getCurrentUser();
    const userToDelete = users.find(u => u.id === userIdToDelete);

    if (!userToDelete) {
        return { success: false, message: "Usuario no encontrado." };
    }

    if (userToDelete.role === 'admin') {
        const adminCount = users.filter(u => u.role === 'admin').length;
        if (adminCount <= 1 && userToDelete.id === loggedInAdmin.id) {
            return { success: false, message: "No se puede eliminar la única cuenta de administrador." };
        }
    }
    
    users = users.filter(u => u.id !== userIdToDelete);
    saveUsers(users);
    return { success: true, message: "Usuario eliminado exitosamente." };
}

function updateAdminCredentials(adminUserId, newUsername, newPassword) {
    if (!isAdminLoggedIn()) return { success: false, message: "No autorizado." };
    let users = getUsers();
    const adminUser = users.find(u => u.id === adminUserId && u.role === 'admin');

    if (adminUser) {
        if (users.find(u => u.username === newUsername && u.id !== adminUserId)) {
            return { success: false, message: 'El nuevo nombre de usuario ya está en uso por otro usuario.' };
        }
        adminUser.username = newUsername;
        adminUser.password = newPassword; 
        saveUsers(users);

        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === adminUserId) {
            // Actualizar también la sesión actual si el admin se cambia a sí mismo
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ username: adminUser.username, role: adminUser.role, id: adminUser.id, nombre: adminUser.nombre }));
        }
        return { success: true, message: 'Credenciales de administrador actualizadas exitosamente.' };
    }
    return { success: false, message: 'Usuario administrador no encontrado o error al actualizar credenciales.' };
}