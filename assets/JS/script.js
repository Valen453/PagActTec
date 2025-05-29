// assets/JS/script.js (para BDD.html)

document.addEventListener('DOMContentLoaded', function() {
  const adminPageContent = document.getElementById('admin-page-content');
  const accessDeniedContent = document.getElementById('access-denied-content');
  const alertPlaceholderBDD = document.getElementById('alert-placeholder-bdd');

  if (isAdminLoggedIn()) {
      adminPageContent.style.display = 'block'; 
      accessDeniedContent.style.display = 'none';
      
      setupAdminHeader();
      renderizarPrendas(); 
      renderizarUsuarios(); 
  } else {
      adminPageContent.style.display = 'none'; 
      accessDeniedContent.style.display = 'block';
      console.warn("Acceso a BDD denegado. Se requiere inicio de sesión como administrador.");
      return; 
  }
  
  const formRopa = document.getElementById('form-ropa');
  if (formRopa) {
      formRopa.addEventListener('submit', function (e) {
          e.preventDefault();
          if (alertPlaceholderBDD) alertPlaceholderBDD.innerHTML = '';
      
          const nombre = document.getElementById('nombre').value.trim();
          const tipo = document.getElementById('tipo').value.trim();
          const descripcion = document.getElementById('descripcion').value.trim();
          const precioInput = document.getElementById('precio').value;
          const talla = document.getElementById('talla').value.trim();
          const imagenInput = document.getElementById('imagen');
          const esDestacado = document.getElementById('destacado').checked;

          if (!nombre || !tipo || !precioInput || !talla) {
              showAlertBDD("Los campos Nombre, Tipo, Precio y Talla son obligatorios.", 'warning');
              return;
          }
          const precio = parseFloat(precioInput);
          if (isNaN(precio) || precio <= 0) {
              showAlertBDD("El precio debe ser un número válido y mayor que cero.", 'warning');
              return;
          }
      
          if (imagenInput.files && imagenInput.files[0]) {
              const reader = new FileReader();
              reader.onload = function (event) {
                  const prenda = {
                      id: 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), // ID más único
                      nombre: nombre,
                      tipo: tipo,
                      descripcion: descripcion,
                      precio: precio, // Ya es un número
                      imagen: event.target.result, 
                      talla: talla,
                      destacado: esDestacado
                  };
          
                  const prendas = obtenerPrendas();
                  prendas.push(prenda);
                  guardarPrendas(prendas);
                  renderizarPrendas(); // Actualizar la lista en BDD
                  showAlertBDD('Prenda agregada exitosamente.', 'success');
                  formRopa.reset();
              };
              reader.onerror = function() {
                  showAlertBDD("Error al leer el archivo de imagen.", "danger");
              };
              reader.readAsDataURL(imagenInput.files[0]); 
          } else {
              showAlertBDD("Por favor, selecciona una imagen para la prenda.", 'warning');
          }
      });
  }

  const formChangeAdminCredentials = document.getElementById('form-change-admin-credentials');
  if (formChangeAdminCredentials) {
      formChangeAdminCredentials.addEventListener('submit', function(e) {
          e.preventDefault();
          if (alertPlaceholderBDD) alertPlaceholderBDD.innerHTML = '';
          const currentUser = getCurrentUser(); 
          if (!currentUser || currentUser.role !== 'admin') { 
              showAlertBDD('Acción no autorizada.', 'danger');
              return;
          }
          const newUsername = document.getElementById('admin_new_username').value.trim();
          const newPassword = document.getElementById('admin_new_password').value; // No hacer trim a la contraseña

          if (!newUsername || !newPassword) { // Contraseña no puede estar vacía
               showAlertBDD('El nombre de usuario y la contraseña no pueden estar vacíos.', 'warning');
               return;
          }

          const result = updateAdminCredentials(currentUser.id, newUsername, newPassword); 
          showAlertBDD(result.message, result.success ? 'success' : 'danger');
          if (result.success) {
              formChangeAdminCredentials.reset();
              setupAdminHeader(); // Actualizar saludo si el nombre cambió
          }
      });
  }
});

function showAlertBDD(message, type = 'danger') {
  const alertPlaceholderBDD = document.getElementById('alert-placeholder-bdd');
  if (alertPlaceholderBDD) {
      alertPlaceholderBDD.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
                                          ${message}
                                          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                        </div>`;
  } else {
      console.error("Placeholder para alertas BDD no encontrado.");
  }
}

function setupAdminHeader() {
  const adminActionsHeader = document.getElementById('admin-actions-header');
  if (!adminActionsHeader) return;
  adminActionsHeader.innerHTML = ''; 
  
  const currentUser = getCurrentUser(); 
  if (currentUser && currentUser.role === 'admin') {
      const greeting = document.createElement('span');
      greeting.textContent = `Admin: ${currentUser.nombre}`;
      greeting.className = 'me-3 text-light';
      adminActionsHeader.appendChild(greeting);

      const goToSiteButton = document.createElement('a');
      goToSiteButton.href = 'index.html';
      goToSiteButton.textContent = 'Ir al Sitio';
      goToSiteButton.className = 'btn btn-outline-info me-2';
      adminActionsHeader.appendChild(goToSiteButton);

      const logoutButton = document.createElement('button');
      logoutButton.textContent = 'Cerrar Sesión';
      logoutButton.className = 'btn btn-outline-warning';
      logoutButton.onclick = function() {
          logout(); 
      };
      adminActionsHeader.appendChild(logoutButton);
  }
}

function obtenerPrendas() {
const prendasJSON = localStorage.getItem('prendas');
try {
  return prendasJSON ? JSON.parse(prendasJSON) : [];
} catch (e) {
  console.error("Error al parsear prendas de localStorage:", e);
  localStorage.removeItem('prendas'); // Opcional: limpiar datos corruptos
  return []; // Devolver vacío para evitar más errores
}
}

function guardarPrendas(prendas) {
try {
  localStorage.setItem('prendas', JSON.stringify(prendas));
} catch (e) {
  console.error("Error al guardar prendas en localStorage:", e);
  showAlertBDD("No se pudieron guardar las prendas. Posiblemente el almacenamiento está lleno.", "danger");
}
}

function crearElementoPrenda(prenda) {
const item = document.createElement('div');
item.className = 'ropa-item d-flex justify-content-between align-items-center p-2 mb-2';

const esDestacadoInfo = prenda.destacado ? '<span class="badge bg-warning text-dark ms-2">Destacado</span>' : '';
const descripcionCorta = prenda.descripcion ? (prenda.descripcion.length > 70 ? prenda.descripcion.substring(0, 70) + '...' : prenda.descripcion) : 'Sin descripción';

item.innerHTML = `
  <div class="d-flex align-items-center">
    <img src="${prenda.imagen || 'placeholder.png'}" alt="${prenda.nombre || 'Producto sin nombre'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 15px;">
    <div>
        <strong>${prenda.nombre || 'Producto sin nombre'}</strong> (${prenda.tipo || 'N/A'}) ${esDestacadoInfo}<br>
        <small class="text-muted">Precio: $${prenda.precio !== undefined ? prenda.precio.toFixed(2) : 'N/A'} - Talla: ${prenda.talla || 'N/A'} - ID: ${prenda.id || 'N/A'}</small>
        <p style="font-size: 0.8em; margin-bottom: 0;">${descripcionCorta}</p>
    </div>
  </div>
  <button class="btn btn-sm btn-danger eliminar-prenda-btn" data-prenda-id="${prenda.id}">Eliminar</button>
`;

const eliminarBtn = item.querySelector('.eliminar-prenda-btn');
if (eliminarBtn) {
  eliminarBtn.addEventListener('click', function () {
      const prendaId = this.getAttribute('data-prenda-id');
      if (confirm(`¿Seguro que quieres eliminar la prenda "${prenda.nombre || 'seleccionada'}"?`)) {
          let prendas = obtenerPrendas();
          prendas = prendas.filter(p => p.id !== prendaId); 
          guardarPrendas(prendas);
          renderizarPrendas(); // Volver a dibujar la lista actualizada
          showAlertBDD('Prenda eliminada.', 'info');
      }
  });
}
return item;
}

function renderizarPrendas() {
const lista = document.getElementById('lista-ropa');
if (!lista) {
  console.error("Elemento #lista-ropa no encontrado en BDD.html");
  return; 
}
lista.innerHTML = ''; // Limpiar lista actual
const prendas = obtenerPrendas();
if (prendas.length === 0) {
    lista.innerHTML = '<p class="text-muted">No hay prendas cargadas.</p>';
    return;
}
prendas.forEach(prenda => {
  if (typeof prenda === 'object' && prenda !== null && prenda.id) { // Verificación básica del objeto prenda
      const item = crearElementoPrenda(prenda);
      lista.appendChild(item);
  } else {
      console.warn("Se encontró un objeto de prenda inválido en localStorage:", prenda);
  }
});
}

function renderizarUsuarios() {
  const listaUsuarios = document.getElementById('lista-usuarios');
  if (!listaUsuarios) {
      console.error("Elemento #lista-usuarios no encontrado en BDD.html");
      return;
  }
  listaUsuarios.innerHTML = '';

  const usuarios = getAllUsersForAdminView(); 
  if (usuarios.length === 0) {
      listaUsuarios.innerHTML = '<p class="text-muted">No hay usuarios registrados.</p>';
      return;
  }

  usuarios.forEach(usuario => {
      if (typeof usuario === 'object' && usuario !== null && usuario.id) {
          const itemUsuario = document.createElement('div');
          itemUsuario.className = 'user-item d-flex justify-content-between align-items-center p-2 mb-2';
          
          const userRoleBadge = usuario.role === 'admin' ? '<span class="badge bg-info ms-2">Admin</span>' : '<span class="badge bg-secondary ms-2">Usuario</span>';

          itemUsuario.innerHTML = `
              <div>
                  <strong>${usuario.nombre || 'N/A'}</strong> (Usuario: ${usuario.username || 'N/A'}) ${userRoleBadge}<br>
                  <small class="text-muted">DNI: ${usuario.dni || 'No especificado'} - ID: ${usuario.id}</small>
              </div>
              <button class="btn btn-sm btn-danger eliminar-usuario-btn" data-user-id="${usuario.id}">Eliminar</button>
          `;
          
          const deleteButton = itemUsuario.querySelector('.eliminar-usuario-btn');
          if (deleteButton) {
              deleteButton.addEventListener('click', function() {
                  const userIdToDelete = this.getAttribute('data-user-id');
                  if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.username || 'seleccionado'}? Esta acción no se puede deshacer.`)) {
                      const result = deleteUserAsAdmin(userIdToDelete); 
                      showAlertBDD(result.message, result.success ? 'success' : 'danger');
                      if (result.success) {
                          renderizarUsuarios(); // Volver a dibujar la lista actualizada
                      }
                  }
              });
          }
          listaUsuarios.appendChild(itemUsuario);
      } else {
          console.warn("Se encontró un objeto de usuario inválido:", usuario);
      }
  });
}