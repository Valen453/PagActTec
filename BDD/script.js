// Función para obtener las prendas guardadas en localStorage
function obtenerPrendas() {
  const prendas = localStorage.getItem('prendas');
  return prendas ? JSON.parse(prendas) : [];
}

// Función para guardar prendas en localStorage
function guardarPrendas(prendas) {
  localStorage.setItem('prendas', JSON.stringify(prendas));
}

// Función para crear el HTML de una prenda en la lista de BDD
function crearElementoPrenda(prenda, index) {
  const item = document.createElement('div');
  item.className = 'ropa-item';

  // Mostramos si es destacado para referencia del admin
  const esDestacadoInfo = prenda.destacado ? '<span class="destacado-badge">Destacado</span>' : '';

  item.innerHTML = `
    <div class="ropa-info">
      <img src="${prenda.imagen}" alt="${prenda.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
      <div>
          <strong>${prenda.nombre}</strong> (${prenda.tipo}) - $${prenda.precio} - Talla: ${prenda.talla} ${esDestacadoInfo}
          <p style="font-size: 0.8em; color: #ccc;">${prenda.descripcion ? prenda.descripcion.substring(0, 50) + '...' : 'Sin descripción'}</p>
      </div>
    </div>
    <button class="eliminar-btn">Eliminar</button>
  `;

  item.querySelector('.eliminar-btn').addEventListener('click', function () {
    const prendas = obtenerPrendas();
    prendas.splice(index, 1); 
    guardarPrendas(prendas);
    renderizarPrendas();
  });

  return item;
}

// Función para renderizar todas las prendas
function renderizarPrendas() {
  const lista = document.getElementById('lista-ropa');
  if (!lista) return; // Seguridad por si el elemento no existe
  lista.innerHTML = '';
  const prendas = obtenerPrendas();
  prendas.forEach((prenda, index) => {
    const item = crearElementoPrenda(prenda, index);
    lista.appendChild(item);
  });
}

// Evento de agregar prenda
const formRopa = document.getElementById('form-ropa');
if (formRopa) {
  formRopa.addEventListener('submit', function (e) {
    e.preventDefault();
  
    const nombre = document.getElementById('nombre').value;
    const tipo = document.getElementById('tipo').value;
    const descripcion = document.getElementById('descripcion').value; // Nuevo campo
    const precio = document.getElementById('precio').value;
    const talla = document.getElementById('talla').value;
    const imagenInput = document.getElementById('imagen');
    const esDestacado = document.getElementById('destacado').checked; // Nuevo campo
  
    if (imagenInput.files && imagenInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const prenda = {
          nombre: nombre,
          tipo: tipo,
          descripcion: descripcion, // Guardar descripción
          precio: precio,
          imagen: event.target.result, 
          talla: talla,
          destacado: esDestacado, // Guardar si es destacado
          id: Date.now() // ID único para cada producto, útil para el modal
        };
  
        const prendas = obtenerPrendas();
        prendas.push(prenda);
        guardarPrendas(prendas);
        renderizarPrendas();
  
        formRopa.reset();
      };
      reader.readAsDataURL(imagenInput.files[0]); 
    } else {
      alert("Por favor, selecciona una imagen para la prenda.");
    }
  });
}

// Cargar prendas al iniciar la página
document.addEventListener('DOMContentLoaded', renderizarPrendas);