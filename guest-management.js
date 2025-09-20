// guest-management.js
document.addEventListener('DOMContentLoaded', () => {
    // MODAL ELEMENTS
    const guestModal = document.getElementById('guest-modal');
    const guestForm = document.getElementById('guest-form');
    const modalTitle = document.getElementById('modal-title');
    const addGuestButton = document.getElementById('add-guest'); // Corrected ID
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelGuestButton = document.getElementById('cancel-guest');

    // GUEST LIST ELEMENTS
    const guestTableBody = document.querySelector('#guest-table tbody');
    const totalGuestsSpan = document.getElementById('total-guests');
    const attendingGuestsSpan = document.getElementById('attending-guests');
    const notAttendingGuestsSpan = document.getElementById('not-attending-guests');
    const pendingGuestsSpan = document.getElementById('pending-guests');
    const guestSearchInput = document.getElementById('guest-search');
    const rsvpFilterSelect = document.getElementById('rsvp-filter');

    // INVITATION ELEMENTS
    const sendInvitationsBtn = document.getElementById('send-invitations');
    const previewInvitationBtn = document.getElementById('preview-invitation');
    const invitationMessageTextarea = document.getElementById('invitation-message');
    const templateSelect = document.getElementById('template-select');
    const editorTools = document.querySelector('.editor-tools');
    const invitationPreviewModal = document.getElementById('invitation-preview-modal');
    const invitationPreviewContent = document.querySelector('.invitation-preview-content');
    const sendTestInvitationBtn = document.getElementById('send-test-invitation');
    const confirmSendInvitationsBtn = document.getElementById('confirm-send-invitations');

    let guestsData = []; // Array to hold all fetched guests
    let guestChart; // Chart.js instance

    // --- MODAL FUNCTIONS ---
    function openGuestModal(guest = null) {
        guestForm.reset(); // Clear form for new entry
        modalTitle.textContent = 'Add New Guest';
        if (guest) {
            // Populate form for editing
            modalTitle.textContent = 'Edit Guest';
            guestForm.dataset.editingId = guest.id; // Store ID for update
            document.getElementById('guest-first-name').value = guest.first_name;
            document.getElementById('guest-last-name').value = guest.last_name;
            document.getElementById('guest-email').value = guest.email;
            document.getElementById('guest-phone').value = guest.phone || '';
            document.getElementById('guest-company').value = guest.company || '';
            document.getElementById('guest-notes').value = guest.notes || '';
            document.getElementById('guest-status').value = guest.rsvp_status;
        } else {
            delete guestForm.dataset.editingId; // Ensure no editing ID is present for new guests
        }
        guestModal.style.display = 'flex'; // This makes the modal visible and centered
        // document.body.style.overflow = 'hidden'; // Optional: Prevent scrolling when modal is open
    }

    function closeGuestModal() {
        guestModal.style.display = 'none';
        guestForm.reset();
        // document.body.style.overflow = 'auto'; // Optional: Re-enable scrolling
    }

    // --- EVENT LISTENERS FOR MODAL ---
    addGuestButton.addEventListener('click', () => openGuestModal());
    closeButtons.forEach(btn => btn.addEventListener('click', closeGuestModal));
    cancelGuestButton.addEventListener('click', closeGuestModal);
    window.addEventListener('click', (event) => {
        if (event.target === guestModal) {
            closeGuestModal();
        }
    });

    // --- FETCH & DISPLAY GUESTS ---
    async function fetchAndDisplayGuests() {
        try {
            const response = await fetch('http://localhost:3000/api/guests');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            guestsData = data.guests || []; // Store fetched guests
            renderGuestTable(guestsData); // Render all fetched guests initially
            updateGuestStats();
        } catch (error) {
            console.error('Error fetching guests:', error);
            alert('Failed to load guest list. Please ensure your backend is running.');
        }
    }

    function renderGuestTable(guestsToRender) {
        guestTableBody.innerHTML = ''; // Clear existing rows
        if (guestsToRender.length === 0) {
            guestTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No guests found.</td></tr>';
            return;
        }

        guestsToRender.forEach(guest => {
            const row = guestTableBody.insertRow();
            row.dataset.guestId = guest.id; // Store ID for actions
            row.innerHTML = `
                <td>${guest.first_name} ${guest.last_name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone || 'N/A'}</td>
                <td><span class="rsvp-status ${guest.rsvp_status}">${guest.rsvp_status.replace('_', ' ')}</span></td>
                <td>${guest.invitation_sent ? '<i class="fas fa-check-circle sent"></i> Sent' : '<i class="fas fa-times-circle not-sent"></i> Not Sent'}</td>
                <td class="actions">
                    <button class="action-btn edit-guest-btn" title="Edit Guest"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-guest-btn" title="Delete Guest"><i class="fas fa-trash"></i></button>
                </td>
            `;
        });
        addGuestActionListeners(); // Attach listeners to new buttons
    }

    function addGuestActionListeners() {
        document.querySelectorAll('.edit-guest-btn').forEach(button => {
            button.onclick = (event) => {
                const row = event.target.closest('tr');
                const guestId = row.dataset.guestId;
                const guestToEdit = guestsData.find(g => g.id === guestId);
                if (guestToEdit) {
                    openGuestModal(guestToEdit);
                }
            };
        });

        document.querySelectorAll('.delete-guest-btn').forEach(button => {
            button.onclick = async (event) => {
                const row = event.target.closest('tr');
                const guestId = row.dataset.guestId;
                if (confirm('Are you sure you want to delete this guest?')) {
                    await deleteGuest(guestId);
                }
            };
        });
    }

    // --- CRUD OPERATIONS ---
    guestForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const guestData = {
            first_name: document.getElementById('guest-first-name').value,
            last_name: document.getElementById('guest-last-name').value,
            email: document.getElementById('guest-email').value,
            phone: document.getElementById('guest-phone').value || null,
            company: document.getElementById('guest-company').value || null,
            notes: document.getElementById('guest-notes').value || null,
            rsvp_status: document.getElementById('guest-status').value
        };

        const editingId = guestForm.dataset.editingId;
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `http://localhost:3000/api/guests/${editingId}` : 'http://localhost:3000/api/guests';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(guestData)
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                closeGuestModal();
                fetchAndDisplayGuests(); // Re-fetch and display all guests
            } else {
                alert(`Error: ${result.message}`);
                console.error('Backend error:', result.details);
            }
        } catch (error) {
            console.error('Network or server error:', error);
            alert('An error occurred while saving the guest. Please check your backend server.');
        }
    });

    async function deleteGuest(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/guests/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchAndDisplayGuests(); // Re-fetch and display guests
            } else {
                alert(`Error deleting guest: ${result.message}`);
                console.error('Backend error:', result.details);
            }
        } catch (error) {
            console.error('Network or server error:', error);
            alert('An error occurred while deleting the guest. Please check your backend server.');
        }
    }

    // --- GUEST STATISTICS & CHART ---
    function updateGuestStats() {
        const total = guestsData.length;
        const attending = guestsData.filter(guest => guest.rsvp_status === 'attending').length;
        const notAttending = guestsData.filter(guest => guest.rsvp_status === 'not_attending').length;
        const pending = guestsData.filter(guest => guest.rsvp_status === 'pending').length;

        totalGuestsSpan.textContent = total;
        attendingGuestsSpan.textContent = attending;
        notAttendingGuestsSpan.textContent = notAttending;
        pendingGuestsSpan.textContent = pending;

        updateGuestChart(attending, notAttending, pending);
    }

    function updateGuestChart(attending, notAttending, pending) {
        const ctx = document.getElementById('guest-chart').getContext('2d');

        if (guestChart) {
            guestChart.destroy(); // Destroy previous chart instance
        }

        guestChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Attending', 'Not Attending', 'Pending'],
                datasets: [{
                    data: [attending, notAttending, pending],
                    backgroundColor: ['#4CAF50', '#F44336', '#FFC107'], // Green, Red, Amber
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'RSVP Status Distribution'
                    }
                }
            }
        });
    }

    // --- INVITATION MANAGEMENT ---
    // Update invitation message based on template selection
    templateSelect.addEventListener('change', () => {
        const selectedTemplate = templateSelect.value;
        let message = '';
        switch (selectedTemplate) {
            case 'formal':
                message = `You are cordially invited to our event, {event_name}, on {event_date} at {event_location}. We eagerly await your esteemed presence.`;
                break;
            case 'casual':
                message = `Hey {guest_name}! You're invited to {event_name} on {event_date} at {event_location}. It's going to be a blast, hope to see you there!`;
                break;
            case 'corporate':
                message = `Dear {guest_name}, we invite you to attend {event_name}, an exclusive corporate gathering, taking place on {event_date} at {event_location}. Your participation would be highly valued.`;
                break;
            case 'custom':
                message = `Feel free to write your custom message here. Use placeholders like {guest_name}, {event_name}, {event_date}, {event_location}.`;
                break;
        }
        invitationMessageTextarea.value = message;
    });

    // Insert placeholders into textarea
    editorTools.addEventListener('click', (event) => {
        if (event.target.classList.contains('editor-btn') || event.target.closest('.editor-btn')) {
            const button = event.target.classList.contains('editor-btn') ? event.target : event.target.closest('.editor-btn');
            const tag = `{${button.dataset.tag}}`;
            const start = invitationMessageTextarea.selectionStart;
            const end = invitationMessageTextarea.selectionEnd;
            invitationMessageTextarea.value = invitationMessageTextarea.value.substring(0, start) + tag + invitationMessageTextarea.value.substring(end);
            invitationMessageTextarea.focus();
            invitationMessageTextarea.selectionEnd = start + tag.length; // Position cursor after inserted tag
        }
    });

    previewInvitationBtn.addEventListener('click', () => {
        const guestName = 'John Doe'; // Placeholder for preview
        const eventName = 'Grand Gala Event'; // Placeholder
        const eventDate = 'August 15, 2025'; // Placeholder
        const eventLocation = 'The Grand Ballroom'; // Placeholder
        let previewHtml = invitationMessageTextarea.value;

        // Replace placeholders for preview
        previewHtml = previewHtml
            .replace(/\{guest_name\}/g, guestName)
            .replace(/\{event_name\}/g, eventName)
            .replace(/\{event_date\}/g, eventDate)
            .replace(/\{event_location\}/g, eventLocation);

        invitationPreviewContent.innerHTML = `<p>${previewHtml.replace(/\n/g, '<br>')}</p>`; // Show in preview modal
        invitationPreviewModal.style.display = 'flex'; // Open the preview modal
    });

    // Close preview modal
    document.querySelector('#invitation-preview-modal .close-modal')?.addEventListener('click', () => {
        document.getElementById('invitation-preview-modal').style.display = 'none';
    });

    sendInvitationsBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to send invitations to all pending guests?')) {
            return;
        }
        const invitationMessage = invitationMessageTextarea.value;
        if (!invitationMessage) {
            alert('Please enter an invitation message.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/guests/send-invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: invitationMessage,
                    guestIds: [] // Empty array means send to all pending
                })
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.message);
                fetchAndDisplayGuests(); // Refresh to update invitation_sent status
            } else {
                alert(`Failed to send invitations: ${result.message}`);
                console.error('Backend error:', result.details);
            }
        } catch (error) {
            console.error('Error sending invitations:', error);
            alert('An error occurred while sending invitations. Check your backend and email configuration.');
        }
    });

    // --- SEARCH AND FILTER ---
    function filterGuests() {
        const searchText = guestSearchInput.value.toLowerCase();
        const rsvpStatus = rsvpFilterSelect.value;

        const filtered = guestsData.filter(guest => {
            const matchesSearch = guest.first_name.toLowerCase().includes(searchText) ||
                                  guest.last_name.toLowerCase().includes(searchText) ||
                                  guest.email.toLowerCase().includes(searchText) ||
                                  guest.company?.toLowerCase().includes(searchText);

            const matchesRsvp = rsvpStatus === 'all' || guest.rsvp_status === rsvpStatus;

            return matchesSearch && matchesRsvp;
        });
        renderGuestTable(filtered);
    }

    guestSearchInput.addEventListener('keyup', filterGuests);
    rsvpFilterSelect.addEventListener('change', filterGuests);

    // --- INITIALIZATION ---
    fetchAndDisplayGuests(); // Load guests when the page first loads
    templateSelect.dispatchEvent(new Event('change')); // Set default template message on load
});