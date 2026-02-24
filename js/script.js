const diasContenedor = document.getElementById("dias-calendario");
const mesActualEl = document.getElementById("mes-actual");
const mesAnteriorBtn = document.getElementById("mes-anterior");
const mesSiguienteBtn = document.getElementById("mes-siguiente");

const taskInput = document.getElementById("taskInput");
const btnAgregarTarea = document.getElementById("btn-agregar-tarea");
const listaTareas = document.querySelector(".task-list");

const STORAGE_KEY = "tareas";
const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const hoy = new Date();
let mes = hoy.getMonth();
let anio = hoy.getFullYear();
let diaSeleccionado = null;
let tareas = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function guardarEnStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

function obtenerClaveFecha(dia, mesActual, anioActual) {
  return `${dia}-${mesActual + 1}-${anioActual}`;
}

function tieneTareas(dia, mesActual, anioActual) {
  const fecha = obtenerClaveFecha(dia, mesActual, anioActual);
  return tareas.some((tarea) => tarea.fecha === fecha);
}

function renderCalendario(mesActual, anioActual) {
  let html = `
    <div class="dias-semana">
      <div>Lun</div><div>Mar</div><div>Mie</div>
      <div>Jue</div><div>Vie</div><div>Sab</div><div>Dom</div>
    </div>
  `;

  mesActualEl.textContent = `${meses[mesActual]} ${anioActual}`;

  const primerDia = new Date(anioActual, mesActual, 1).getDay();
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate();
  const inicio = primerDia === 0 ? 6 : primerDia - 1;

  for (let i = 0; i < inicio; i += 1) {
    html += "<div></div>";
  }

  for (let dia = 1; dia <= diasEnMes; dia += 1) {
    let clases = "dia";

    if (
      dia === hoy.getDate() &&
      mesActual === hoy.getMonth() &&
      anioActual === hoy.getFullYear()
    ) {
      clases += " hoy";
    }

    if (tieneTareas(dia, mesActual, anioActual)) {
      clases += " con-tareas";
    }

    if (diaSeleccionado === dia) {
      clases += " activo";
    }

    html += `<div class="${clases}">${dia}</div>`;
  }

  diasContenedor.innerHTML = html;
}

function renderTareas() {
  listaTareas.innerHTML = "";
  if (!diaSeleccionado) return;

  const fechaSeleccionada = obtenerClaveFecha(diaSeleccionado, mes, anio);

  tareas.forEach((tarea, index) => {
    if (tarea.fecha !== fechaSeleccionada) return;

    const li = document.createElement("li");
    if (tarea.completada) li.classList.add("completada");

    li.innerHTML = `
      <span class="texto-tarea">${tarea.texto}</span>
      <button class="btn-eliminar" aria-label="Eliminar tarea">&times;</button>
    `;

    li.addEventListener("click", () => {
      tareas[index].completada = !tareas[index].completada;
      guardarEnStorage();
      renderTareas();
    });

    const btnEliminar = li.querySelector(".btn-eliminar");
    btnEliminar.addEventListener("click", (e) => {
      e.stopPropagation();
      tareas.splice(index, 1);
      guardarEnStorage();
      renderTareas();
      renderCalendario(mes, anio);
    });

    listaTareas.appendChild(li);
  });
}

function agregarTarea() {
  if (!diaSeleccionado) {
    alert("Selecciona un dia primero.");
    return;
  }

  const texto = taskInput.value.trim();
  if (!texto) return;

  tareas.push({
    texto,
    fecha: obtenerClaveFecha(diaSeleccionado, mes, anio),
    completada: false
  });

  guardarEnStorage();
  taskInput.value = "";
  renderTareas();
  renderCalendario(mes, anio);
}

diasContenedor.addEventListener("click", (e) => {
  if (!e.target.classList.contains("dia")) return;
  diaSeleccionado = Number(e.target.textContent);
  renderCalendario(mes, anio);
  renderTareas();
});

btnAgregarTarea.addEventListener("click", agregarTarea);
taskInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  agregarTarea();
});

mesAnteriorBtn.addEventListener("click", () => {
  mes -= 1;
  if (mes < 0) {
    mes = 11;
    anio -= 1;
  }
  renderCalendario(mes, anio);
});

mesSiguienteBtn.addEventListener("click", () => {
  mes += 1;
  if (mes > 11) {
    mes = 0;
    anio += 1;
  }
  renderCalendario(mes, anio);
});

renderCalendario(mes, anio);
