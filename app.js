// Variables Globales
const formData = document.getElementById("form");
const btn = document.getElementById("btnForm");
const tabla = document.querySelector(".info");
//API
//----------------------------------------------------------------------------------
const url = "./db.json";

let editandoId = null; // Guardara el ID si estamos en modo edicion
// Funcion Get
async function get(url) {
  try {
    const response = await fetch(url);

    // Verifica si el código de estado es 200-299
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    // Captura errores de red u otros fallos
    console.error("Error en la solicitud:", error);
  }
}

// Funcion Delete

async function eliminar(id) {
  try {
    const respuesta = await fetch(`${url}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        // Puedes agregar autenticación aquí
      },
    });

    // Verificamos si la respuesta fue exitosa (código 200-299)
    if (!respuesta.ok) {
      throw new Error(`Error al eliminar: ${respuesta.status}`);
    }

    const resultado = await respuesta.json(); // O respuesta.text() si no hay body
    alert("Recurso eliminado:", resultado);
    return true;
  } catch (error) {
    // Captura problemas de red, URL mal formada, o el throw manual
    console.error("Error en la petición DELETE:", error.message);
    return false;
  }
}

// Funcion Crear Post

async function postData(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST", // Método POST
      headers: {
        "Content-Type": "application/json", // Definir formato JSON
      },
      body: JSON.stringify(data), // Convertir datos a cadena
    });

    // Verificar si la respuesta es correcta (status 200-299)
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const resultado = await response.json(); // Parsear respuesta
    alert("Se Creo exitosamente:", resultado);
    return true;
  } catch (error) {
    // Captura fallos de red o el error lanzado anteriormente
    console.error("Error en la petición POST:", error);
  }
}

// Funcion Patch Update

async function update(url, id, newdata) {
  try {
    const respuesta = await fetch(`${url}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newdata),
    });

    if (!respuesta.ok) {
      throw new Error(`Error en PATCH: ${respuesta.status}`);
    }

    const resultado = await respuesta.json();
    alert("Se actualizo exitosamente:", resultado);
    return true;
  } catch (error) {
    console.error("Error en PATCH:", error.message);
  }
}

// Function Render

async function render() {
  const data = await get(url);
  if (!data || data.length === 0) {
    tabla.innerHTML = `<div>No hay resultado</div>`;
    return;
  }

  const row = data
    .map(
      (e) => `
        <tr>
          <td>${e.id}</td>
          <td>${e.fullName}</td>
          <td>${e.gender}</td>
          <td>${e.age}</td>
          <td>
          <button data-id="${e.id}" class="btn btn-sm btn-warning update">Edit</button>
          <button data-id="${e.id}" class="btn btn-sm btn-danger delete">Delete</button>
          </td>
        </tr>
      `,
    )
    .join("");

  tabla.innerHTML = row;
}

// --------------------------------------------------------------------------------

// DOM

// -----------------------------------------------------------------------------------

btn.addEventListener("click", async (e) => {
  e.preventDefault();

  const datos = new FormData(formData);
  const dataInput = Object.fromEntries(datos.entries());

  // Validación rápida
  for (const valor of datos.values()) {
    if (valor.trim() === "") {
      alert("Por favor, llena todos los campos");
      return;
    }
  }

  if (editandoId) {
    // MODO ACTUALIZAR
    const exito = await update(url, editandoId, dataInput);
    if (exito) {
      editandoId = null;
      btn.textContent = "Crear";
      btn.classList.replace("btn-warning", "btn-primary");
    }
  } else {
    // MODO CREAR
    await postData(url, dataInput);
  }

  render(); // Refrescar tabla
  formData.reset(); // Limpiar campos
});

document.addEventListener("click", async function (e) {
  // --- LOGICA EDITAR ---
  const id = e.target.dataset.id;
  if (e.target.classList.contains("update")) {
    // 1. Buscamos los datos actuales (puedes pedirlos a la API o sacarlos de la fila)
    const data = await get(`${url}/${id}`);

    if (data) {
      // 2. Llenamos el formulario con los datos recibidos
      document.getElementById("fullName").value = data.fullName;
      document.getElementById("cc").value = data.cedula;
      document.getElementById("gender").value = data.gender;
      document.getElementById("age").value = data.age;
      document.getElementById("phone").value = data.phone;

      // 3. Cambiamos el estado a modo edicion
      editandoId = id;
      btn.textContent = "Actualizar Registro"; // Cambiamos el texto del boton
      btn.classList.replace("btn-primary", "btn-warning"); // Cambiamos color
    }
  }
  if (e.target.classList.contains("delete")) {
    eliminar(id);
  }
});
render();
