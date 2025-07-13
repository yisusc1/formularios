document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('planificacionForm');
    const pendingListContainer = document.getElementById('pending-list-container');
    const loadingMessage = document.getElementById('loading-message');

    // 1. Cargar las solicitudes pendientes al abrir la página
    google.script.run
        .withSuccessHandler(displayPendingInstallations)
        .withFailureHandler(error => {
            pendingListContainer.innerHTML = `<p style="color: #dc3545; font-weight: bold;">Error al cargar: ${error.message || error}</p><p>Por favor, revisa que los nombres de las columnas en la pestaña "Solicitudes" sean correctos.</p>`;
        })
        .getPendingInstallations();

    // 2. Función para mostrar las solicitudes en el HTML
    function displayPendingInstallations(installations) {
        if (installations.length === 0) {
            loadingMessage.textContent = 'No hay solicitudes pendientes por asignar.';
            return;
        }
        loadingMessage.style.display = 'none';

        let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
        installations.forEach(inst => {
            html += `
                <li style="padding: 0.75rem; border-bottom: 1px solid #eee;">
                    <label style="display: flex; align-items: center; gap: 1rem; font-weight: normal; font-size: 1rem;">
                        <input type="checkbox" name="solicitud" value="${inst.id}" style="width: auto;">
                        <strong>${inst.cliente}</strong> - ${inst.sector}
                    </label>
                </li>
            `;
        });
        html += '</ul>';
        pendingListContainer.innerHTML = html;
    }

    // 3. Lógica de envío del formulario
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const checkedBoxes = form.querySelectorAll('input[name="solicitud"]:checked');
        if (checkedBoxes.length === 0) {
            alert('Debes seleccionar al menos una solicitud para planificar.');
            return;
        }

        const idsSeleccionadas = Array.from(checkedBoxes).map(cb => cb.value);

        const formData = {
            formType: 'planificacion',
            fecha_asignada: document.getElementById('fecha-asignada').value,
            equipo_asignado: document.getElementById('equipo-asignado').value,
            ids_solicitudes: idsSeleccionadas
        };

        const submitButton = form.querySelector('button[type="submit"]');
        const statusMessage = document.getElementById('status-message');
        
        submitButton.disabled = true;
        submitButton.textContent = 'Guardando...';

        google.script.run
            .withSuccessHandler(response => {
                const res = JSON.parse(response);
                if (res.result !== 'success') throw new Error(res.message);
                
                statusMessage.className = 'status-message success';
                statusMessage.textContent = '¡Planificación guardada con éxito! La página se recargará.';
                setTimeout(() => location.reload(), 2000);
            })
            .withFailureHandler(error => {
                statusMessage.className = 'status-message error';
                statusMessage.textContent = `Error: ${error.message || error}`;
                submitButton.disabled = false;
                submitButton.textContent = 'Guardar Planificación';
            })
            .doPost({ postData: { contents: JSON.stringify(formData) } }); // Llama a doPost
    });
});
