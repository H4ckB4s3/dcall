        document.addEventListener('DOMContentLoaded', function() {
            // Set current year in footer
            document.getElementById('currentYear').textContent = new Date().getFullYear();

            // DOM Elements
            const settingsBtn = document.getElementById('settingsBtn');
            const settingsMenu = document.getElementById('settingsMenu');
            const domainInput = document.getElementById('domainInput');
            const saveBtn = document.getElementById('saveBtn');
            const callBtn = document.getElementById('callBtn');
            const callMenu = document.getElementById('callMenu');
            const refreshBtn = document.getElementById('refreshBtn');
            const contactsList = document.getElementById('contactsList');
            const backupBtn = document.getElementById('backupBtn');
            const restoreBtn = document.getElementById('restoreBtn');
            const clearBtn = document.getElementById('clearBtn');
            const lastUpdateSpan = document.getElementById('lastUpdate');

            // State
            let contacts = JSON.parse(localStorage.getItem('dcall-contacts')) || [];
            let currentContactData = null;
            let debounceTimeout = null;
            let lastUpdate = localStorage.getItem('dcall-last-update') || null;

            // Initialize
            updateLastUpdateDisplay();
            renderContacts();

            // Event Listeners
            settingsBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                settingsMenu.classList.toggle('show');
            });

            domainInput.addEventListener('input', function() {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    handleDomainInput();
                    filterAndRenderContacts(this.value.trim().toLowerCase());
                }, 300); // Reduced debounce time for more responsive filtering
            });

            domainInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && this.value.trim()) {
                    e.preventDefault();
                    clearTimeout(debounceTimeout);
                    handleDomainInput().then(() => {
                        if (currentContactData) {
                            saveContact();
                        }
                    });
                }
            });

            saveBtn.addEventListener('click', saveContact);
            callBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (currentContactData) {
                    if (currentContactData.phone) {
                        window.open('tel:' + currentContactData.phone);
                    } else if (currentContactData.tb) {
                        copyToClipboard(currentContactData.tb);
                    } else {
                        callMenu.classList.toggle('show');
                    }
                }
            });
            refreshBtn.addEventListener('click', refreshContacts);
            backupBtn.addEventListener('click', backupContacts);
            restoreBtn.addEventListener('click', restoreContacts);
            clearBtn.addEventListener('click', clearAllData);

            // Close menus when clicking outside
            document.addEventListener('click', function(e) {
                if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
                    settingsMenu.classList.remove('show');
                }
                if (!callMenu.contains(e.target) && e.target !== callBtn) {
                    callMenu.classList.remove('show');
                }
            });

            // Functions
            function updateLastUpdateDisplay() {
                if (lastUpdate) {
                    const date = new Date(lastUpdate);
                    lastUpdateSpan.textContent = `Updated: ${date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`;
                } else {
                    lastUpdateSpan.textContent = '';
                }
            }

            async function handleDomainInput() {
                const domain = domainInput.value.trim();
                if (domain) {
                    try {
                        const txtRecords = await fetchTXTRecords(domain);
                        if (txtRecords) {
                            const hasValidRecord = txtRecords.some(record => 
                                record.startsWith('tel:') || 
                                record.startsWith('wa:') || 
                                record.startsWith('tg:') ||
                                record.startsWith('url:') ||
                                record.startsWith('link:') ||
                                record.startsWith('x:') ||
                                record.startsWith('sn:') ||
                                record.startsWith('mail:') ||
                                record.startsWith('sx:') ||
                                record.startsWith('tb:') ||
                                record.startsWith('ln:')
                            );

                            if (hasValidRecord) {
                                currentContactData = {
                                    domain,
                                    phone: getRecordValue(txtRecords, 'tel'),
                                    pfp: getRecordValue(txtRecords, 'pfp'),
                                    wa: getRecordValue(txtRecords, 'wa'),
                                    tg: getRecordValue(txtRecords, 'tg'),
                                    x: getRecordValue(txtRecords, 'x'),
                                    url: getRecordValue(txtRecords, 'url'),
                                    link: getRecordValue(txtRecords, 'link'),
                                    tb: getRecordValue(txtRecords, 'tb'),
                                    onion: getRecordValue(txtRecords, 'onion'),
                                    sn: getRecordValue(txtRecords, 'sn'),
                                    mail: getRecordValue(txtRecords, 'mail'),
                                    gh: getRecordValue(txtRecords, 'gh'),
                                    ig: getRecordValue(txtRecords, 'ig'),
                                    fb: getRecordValue(txtRecords, 'fb'),
                                    yt: getRecordValue(txtRecords, 'yt'),
                                    rumble: getRecordValue(txtRecords, 'rumble'),
                                    ens: getRecordValue(txtRecords, 'ens'),
                                    nostr: getRecordValue(txtRecords, 'nostr'),
                                    pk: getRecordValue(txtRecords, 'pk'),
                                    matrix: getRecordValue(txtRecords, 'matrix'),
                                    sx: getRecordValue(txtRecords, 'sx'),
                                    bsky: getRecordValue(txtRecords, 'bsky'),
                                    btc: getRecordValue(txtRecords, 'btc'),
                                    ln: getRecordValue(txtRecords, 'ln'),
                                    hns: getRecordValue(txtRecords, 'hns'),
                                    eth: getRecordValue(txtRecords, 'eth'),
                                    xmr: getRecordValue(txtRecords, 'xmr'),
                                    zec: getRecordValue(txtRecords, 'zec'),
                                    bat: getRecordValue(txtRecords, 'bat')
                                };

                                domainInput.classList.add('valid');
                                callBtn.disabled = false;
                                updateCallButton(currentContactData);
                                updateCallMenu(currentContactData);
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching TXT records:', error);
                    }
                }
                
                // Reset if no valid records found
                currentContactData = null;
                domainInput.classList.remove('valid');
                callBtn.disabled = true;
                callBtn.innerHTML = '<img src="img/tel.png" alt="Phone Icon">';
                callBtn.style.backgroundColor = 'var(--success-color)';
                callMenu.classList.remove('show');
                callMenu.innerHTML = '';
            }

            function updateCallButton(contact) {
                callBtn.classList.add('search-btn');
                callBtn.classList.remove('dropdown-btn');
                callBtn.style.backgroundColor = ''; // Reset background
                if (contact.phone) {
                    callBtn.innerHTML = '<img src="img/tel.png" alt="Phone Icon">';
                    callBtn.style.backgroundColor = 'var(--tel-color)';
                } else if (contact.sn) {
                    callBtn.innerHTML = '<img src="img/sn.png" alt="Signal Icon">';
                    callBtn.style.backgroundColor = 'var(--sn-color)';
                } else if (contact.tg) {
                    callBtn.innerHTML = '<img src="img/tg.png" alt="Telegram Icon">';
                    callBtn.style.backgroundColor = 'var(--tg-color)';
                } else if (contact.mail) {
                    callBtn.innerHTML = '<img src="img/mail.png" alt="Mail Icon">';
                    callBtn.style.backgroundColor = 'var(--mail-color)';
                } else if (contact.sx) {
                    callBtn.innerHTML = '<img src="img/simplex.png" alt="SimpleX Icon">';
                    callBtn.style.backgroundColor = 'var(--sx-color)';
                } else if (contact.wa) {
                    callBtn.innerHTML = '<img src="img/wa.png" alt="WhatsApp Icon">';
                    callBtn.style.backgroundColor = 'var(--wa-color)';
                } else if (contact.tb) {
                    callBtn.innerHTML = '<img src="img/tb.png" alt="Thunderbolt Icon">';
                    callBtn.classList.add('dropdown-btn');
                    callBtn.style.backgroundColor = 'var(--tb-color)';
                } else {
                    callBtn.innerHTML = '<img src="img/tel.png" alt="Phone Icon">';
                    callBtn.style.backgroundColor = 'var(--success-color)';
                }
            }

            function updateCallMenu(contact) {
                callMenu.innerHTML = '';
                
                if (contact.phone) {
                    const phoneItem = document.createElement('div');
                    phoneItem.className = 'settings-item';
                    phoneItem.innerHTML = `
                        <img src="img/tel.png" alt="Phone Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>Call ${contact.phone}</span>
                    `;
                    phoneItem.addEventListener('click', () => {
                        window.open('tel:' + contact.phone);
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(phoneItem);
                }

                if (contact.sn) {
                    const snItem = document.createElement('div');
                    snItem.className = 'settings-item';
                    snItem.innerHTML = `
                        <img src="img/sn.png" alt="Signal Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>Signal</span>
                    `;
                    snItem.addEventListener('click', () => {
                        window.open('https://signal.me/#p/' + contact.sn);
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(snItem);
                }

                if (contact.tg) {
                    const tgItem = document.createElement('div');
                    tgItem.className = 'settings-item';
                    tgItem.innerHTML = `
                        <img src="img/tg.png" alt="Telegram Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>Telegram</span>
                    `;
                    tgItem.addEventListener('click', () => {
                        window.open('https://t.me/' + contact.tg);
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(tgItem);
                }

                if (contact.mail) {
                    const mailItem = document.createElement('div');
                    mailItem.className = 'settings-item';
                    mailItem.innerHTML = `
                        <img src="img/mail.png" alt="Mail Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>Email</span>
                    `;
                    mailItem.addEventListener('click', () => {
                        window.open('mailto:' + contact.mail);
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(mailItem);
                }

                if (contact.sx) {
                    const sxItem = document.createElement('div');
                    sxItem.className = 'settings-item';
                    sxItem.innerHTML = `
                        <img src="img/simplex.png" alt="SimpleX Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>SimpleX</span>
                    `;
                    sxItem.addEventListener('click', () => {
                        window.open('https://simplex.chat/contact#/' + contact.sx.replace(/\s+/g, '') + '.onion');
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(sxItem);
                }

                if (contact.wa) {
                    const waItem = document.createElement('div');
                    waItem.className = 'settings-item';
                    waItem.innerHTML = `
                        <img src="img/wa.png" alt="WhatsApp Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>WhatsApp</span>
                    `;
                    waItem.addEventListener('click', () => {
                        window.open('https://wa.me/' + contact.wa);
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(waItem);
                }

                if (contact.tb) {
                    const tbItem = document.createElement('div');
                    tbItem.className = 'settings-item';
                    tbItem.innerHTML = `
                        <img src="img/tb.png" alt="Thunderbolt Icon" style="width: 24px; height: 24px; margin-right: 12px;">
                        <span>Copy Thunderbolt username</span>
                    `;
                    tbItem.addEventListener('click', () => {
                        copyToClipboard(contact.tb);
                        callMenu.classList.remove('show');
                    });
                    callMenu.appendChild(tbItem);
                }

                if (callMenu.children.length === 0) {
                    const noOption = document.createElement('div');
                    noOption.className = 'settings-item';
                    noOption.innerHTML = `
                        <i class="material-icons">info</i>
                        <span>No call options</span>
                    `;
                    callMenu.appendChild(noOption);
                }
            }

            async function saveContact() {
                const domain = domainInput.value.trim();
                if (!domain) {
                    alert('Please enter a domain');
                    return;
                }

                // Check if contact already exists
                const existingIndex = contacts.findIndex(contact => contact.domain === domain);
                if (existingIndex >= 0) {
                    if (confirm('This contact already exists. Update it?')) {
                        contacts[existingIndex] = currentContactData;
                        contacts[existingIndex].lastUpdated = new Date().toISOString();
                    } else {
                        return;
                    }
                } else {
                    if (!currentContactData) {
                        alert('No valid contact data found for this domain');
                        return;
                    }
                    currentContactData.lastUpdated = new Date().toISOString();
                    contacts.push(currentContactData);
                }

                lastUpdate = new Date().toISOString();
                localStorage.setItem('dcall-last-update', lastUpdate);
                updateLastUpdateDisplay();
                saveContacts();
                domainInput.value = '';
                domainInput.classList.remove('valid');
                callBtn.disabled = true;
                callBtn.innerHTML = '<img src="img/tel.png" alt="Phone Icon">';
                callBtn.style.backgroundColor = 'var(--success-color)';
                callMenu.classList.remove('show');
                renderContacts();
            }

		function getRecordValue(records, prefix) {
		    const record = records.find(r => r.startsWith(prefix + ':'));
		    if (!record) return null;

		    let value = record.split(prefix + ':')[1];
		    
		    // Apply phone number formatting logic for 'tel' prefix
		    if (prefix === 'tel') {
			if (value.startsWith('+')) {
			    // Keep the + if it already exists
			    return value;
			} else if (value.startsWith('00')) {
			    // Replace 00 with +
			    return '+' + value.slice(2);
			} else if (/^\d/.test(value)) {
			    // Prepend + if it starts with a digit
			    return '+' + value;
			}
		    }
		    
		    return value;
		}

            function removeContact(domain) {
                if (confirm(`Are you sure you want to remove ${domain}?`)) {
                    contacts = contacts.filter(contact => contact.domain !== domain);
                    lastUpdate = new Date().toISOString();
                    localStorage.setItem('dcall-last-update', lastUpdate);
                    localStorage.setItem('dcall-contacts', JSON.stringify(contacts));
                    updateLastUpdateDisplay();
                    renderContacts();
                    alert('Contact removed successfully!');
                }
            }

            function refreshContacts() {
                if (contacts.length === 0) {
                    alert('No contacts to refresh');
                    return;
                }

                const updatePromises = contacts.map(async (contact, index) => {
                    try {
                        const txtRecords = await fetchTXTRecords(contact.domain);
                        if (txtRecords) {
                            contacts[index] = {
                                domain: contact.domain,
                                phone: getRecordValue(txtRecords, 'tel') || contact.phone,
                                pfp: getRecordValue(txtRecords, 'pfp') || contact.pfp,
                                wa: getRecordValue(txtRecords, 'wa') || contact.wa,
                                tg: getRecordValue(txtRecords, 'tg') || contact.tg,
                                x: getRecordValue(txtRecords, 'x') || contact.x,
                                url: getRecordValue(txtRecords, 'url') || contact.url,
                                link: getRecordValue(txtRecords, 'link') || contact.link,
                                tb: getRecordValue(txtRecords, 'tb') || contact.tb,
                                onion: getRecordValue(txtRecords, 'onion') || contact.onion,
                                sn: getRecordValue(txtRecords, 'sn') || contact.sn,
                                mail: getRecordValue(txtRecords, 'mail') || contact.mail,
                                gh: getRecordValue(txtRecords, 'gh') || contact.gh,
                                ig: getRecordValue(txtRecords, 'ig') || contact.ig,
                                fb: getRecordValue(txtRecords, 'fb') || contact.fb,
                                yt: getRecordValue(txtRecords, 'yt') || contact.yt,
                                rumble: getRecordValue(txtRecords, 'rumble') || contact.rumble,
                                ens: getRecordValue(txtRecords, 'ens') || contact.ens,
                                nostr: getRecordValue(txtRecords, 'nostr') || contact.nostr,
                                pk: getRecordValue(txtRecords, 'pk') || contact.pk,
                                matrix: getRecordValue(txtRecords, 'matrix') || contact.matrix,
                                sx: getRecordValue(txtRecords, 'sx') || contact.sx,
                                bsky: getRecordValue(txtRecords, 'bsky') || contact.bsky,
                                btc: getRecordValue(txtRecords, 'btc') || null,
                                ln: getRecordValue(txtRecords, 'ln') || null,
                                hns: getRecordValue(txtRecords, 'hns') || null,
                                eth: getRecordValue(txtRecords, 'eth') || null,
                                xmr: getRecordValue(txtRecords, 'xmr') || null,
                                zec: getRecordValue(txtRecords, 'zec') || null,
                                bat: getRecordValue(txtRecords, 'bat') || null,
                                lastUpdated: new Date().toISOString()
                            };
                        }
                    } catch (error) {
                        console.error(`Error updating ${contact.domain}:`, error);
                    }
                });

                Promise.all(updatePromises).then(() => {
                    lastUpdate = new Date().toISOString();
                    localStorage.setItem('dcall-last-update', lastUpdate);
                    updateLastUpdateDisplay();
                    saveContacts();
                    renderContacts();
                    alert('Contacts updated successfully!');
                });
            }

            function filterAndRenderContacts(searchTerm) {
                renderContacts(searchTerm);
            }

            function renderContacts(searchTerm = '') {
                let filteredContacts = contacts;
                if (searchTerm) {
                    filteredContacts = contacts.filter(contact => 
                        contact.domain.toLowerCase().startsWith(searchTerm.toLowerCase())
                    );
                }

                if (filteredContacts.length === 0) {
                    contactsList.innerHTML = `
                        <div class="empty-state">
                            <i class="material-icons">contacts</i>
                            <p>${searchTerm ? 'No contacts match your search' : 'No contacts saved yet'}</p>
                        </div>
                    `;
                    return;
                }

                // Group contacts by first letter
                const groupedContacts = filteredContacts.reduce((acc, contact) => {
                    const firstLetter = contact.domain.charAt(0).toUpperCase();
                    if (!acc[firstLetter]) {
                        acc[firstLetter] = [];
                    }
                    acc[firstLetter].push(contact);
                    return acc;
                }, {});

                // Sort letters alphabetically
                const sortedLetters = Object.keys(groupedContacts).sort();

                // Generate HTML
                let html = '';
                sortedLetters.forEach(letter => {
                    const letterContacts = groupedContacts[letter].sort((a, b) => 
                        a.domain.localeCompare(b.domain));

                    html += `
                        <div class="letter-section">
                            <h3 class="letter-heading">${letter}</h3>
                            ${letterContacts.map(contact => renderContact(contact)).join('')}
                        </div>
                    `;
                });

                contactsList.innerHTML = html;

                // Add event listeners to dropdown buttons
                document.querySelectorAll('.dropdown-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        const contactId = this.getAttribute('data-contact-id');
                        const details = document.getElementById(`details-${contactId}`);
                        details.classList.toggle('show');
                        this.classList.toggle('rotated');
                    });
                });

                // Add event listeners to clickable icons and labels 
                document.querySelectorAll('.detail-icon, .detail-label').forEach(element => {
                    element.addEventListener('click', function(e) {
                        const detailItem = this.closest('.detail-item');
                        const platform = detailItem.getAttribute('data-platform');
                        const value = detailItem.getAttribute('data-value');
			if (platform === 'tb' || platform === 'btc' || platform === 'ln' || 
			    platform === 'hns' || platform === 'eth' || platform === 'xmr' || platform === 'zec' || platform === 'bat') {
			    copyToClipboard(value);
			} else if (platform === 'onion') {
			    window.open('http://' + value);
			} else if (platform === 'phone') {
                            window.open('tel:' + value);
                        } else if (platform === 'sn') {
                            window.open('https://signal.me/#p/' + value);
                        } else if (platform === 'tg') {
                            window.open('https://t.me/' + value);
                        } else if (platform === 'mail') {
                            window.open('mailto:' + value);
                        } else if (platform === 'sx') {
                            window.open('https://simplex.chat/contact#/' + value.replace(/\s+/g, '') + '.onion');
                        } else if (platform === 'wa') {
                            window.open('https://wa.me/' + value);
                        } else if (platform === 'x') {
                            window.open('https://x.com/' + value);
                        } else if (platform === 'url' || platform === 'link') {
                            window.open('http://' + value);
                        } else if (platform === 'gh') {
                            window.open('https://github.com/' + value);
                        } else if (platform === 'ig') {
                            window.open('https://www.instagram.com/' + value + '/');
                        } else if (platform === 'fb') {
                            window.open('https://www.facebook.com/' + value);
                        } else if (platform === 'yt') {
                            window.open('https://www.youtube.com/@' + value);
                        } else if (platform === 'rumble') {
                            window.open('https://rumble.com/' + value);
                        } else if (platform === 'ens') {
                            window.open('http://' + value + '.limo');
                        } else if (platform === 'nostr') {
                            window.open('nostr:' + value);
                        } else if (platform === 'pk') {
                            window.open('http://' + value + '/');
                        } else if (platform === 'matrix') {
                            window.open('https://matrix.to/#/@' + value + ':matrix.org');
                        } else if (platform === 'bsky') {
                            window.open(value.includes('.') ? `https://bsky.app/profile/${value}` : `https://bsky.app/profile/${value}.bsky.social`);
                        }
                    });
                });

                // Add event listeners to remove contact buttons
                document.querySelectorAll('.remove-contact-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        const domain = this.getAttribute('data-domain');
                        removeContact(domain);
                    });
                });

                // Add event listeners to crypto icons
                document.querySelectorAll('.crypto-icon').forEach(icon => {
                    icon.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        const value = this.getAttribute('data-value');
                        copyToClipboard(value);
                    });
                });
            }

            function renderContact(contact) {
                const contactId = contact.domain.replace(/[^a-z0-9]/gi, '_');
                const initials = contact.domain.charAt(0).toUpperCase();
                const hasDetails = contact.wa || contact.tg || contact.x || contact.url || 
                                 contact.link || contact.tb || contact.onion || contact.sn || contact.mail || 
                                 contact.gh || contact.ig || contact.fb || contact.yt || 
                                 contact.rumble || contact.ens || contact.nostr || contact.pk || 
                                 contact.matrix || contact.sx || contact.bsky || contact.btc || 
                                 contact.ln || contact.hns || contact.eth || contact.xmr || 
                                 contact.zec || contact.bat || contact.phone;

                return `
                    <div class="contact-card">
                        <div class="contact-avatar">
                            ${contact.pfp ? 
                                `<img src="https://${contact.pfp}" alt="${contact.domain}" onerror="this.parentElement.textContent='${initials}'">` : 
                                initials}
                        </div>
                        <div class="contact-info">
                            <div class="contact-name">${contact.domain}</div>
                        </div>
                        <div class="contact-actions">
                            ${contact.phone ? `
                                <button class="action-btn call-btn" style="background-color: var(--tel-color);" onclick="window.open('tel:${contact.phone}')">
                                    <img src="img/tel.png" alt="Phone Icon">
                                </button>
                            ` : contact.sn ? `
                                <button class="action-btn call-btn" style="background-color: var(--sn-color);" onclick="window.open('https://signal.me/#p/${contact.sn}')">
                                    <img src="img/sn.png" alt="Signal Icon">
                                </button>
                            ` : contact.tg ? `
                                <button class="action-btn call-btn" style="background-color: var(--tg-color);" onclick="window.open('https://t.me/${contact.tg}')">
                                    <img src="img/tg.png" alt="Telegram Icon">
                                </button>
                            ` : contact.mail ? `
                                <button class="action-btn call-btn" style="background-color: var(--mail-color);" onclick="window.open('mailto:${contact.mail}')">
                                    <img src="img/mail.png" alt="Mail Icon">
                                </button>
                            ` : contact.sx ? `
                                <button class="action-btn call-btn" style="background-color: var(--sx-color);" onclick="window.open('https://simplex.chat/contact#/${contact.sx.replace(/\s+/g, '')}.onion')">
                                    <img src="img/simplex.png" alt="SimpleX Icon">
                                </button>
                            ` : contact.wa ? `
                                <button class="action-btn call-btn" style="background-color: var(--wa-color);" onclick="window.open('https://wa.me/${contact.wa}')">
                                    <img src="img/wa.png" alt="WhatsApp Icon">
                                </button>
                            ` : contact.tb ? `
                                <button class="action-btn call-btn" style="background-color: var(--tb-color);" onclick="copyToClipboard('${contact.tb}')">
                                    <img src="img/tb.png" alt="Thunderbolt Icon">
                                </button>
                            ` : ''}
                            ${hasDetails ? `
                                <button class="action-btn dropdown-btn" data-contact-id="${contactId}">
                                    <i class="material-icons">expand_more</i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    ${hasDetails ? `
                        <div class="contact-details" id="details-${contactId}">
                            ${contact.phone ? `
                                <div class="detail-item" data-platform="phone" data-value="${contact.phone}">
                                    <div class="detail-icon">
                                        <img src="img/tel.png" alt="Phone Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.phone}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.wa ? `
                                <div class="detail-item" data-platform="wa" data-value="${contact.wa}">
                                    <div class="detail-icon">
                                        <img src="img/wa.png" alt="WhatsApp Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.wa}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.tg ? `
                                <div class="detail-item" data-platform="tg" data-value="${contact.tg}">
                                    <div class="detail-icon">
                                        <img src="img/tg.png" alt="Telegram Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.tg}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.x ? `
                                <div class="detail-item" data-platform="x" data-value="${contact.x}">
                                    <div class="detail-icon">
                                        <img src="img/x.png" alt="X Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.x}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.url ? `
                                <div class="detail-item" data-platform="url" data-value="${contact.url}">
                                    <div class="detail-icon">
                                        <a href="http://${contact.url}" target="_blank">
                                            <img src="img/link.png" alt="Link Icon" style="width: 24px; height: 24px;">
                                        </a>
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.url}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.link ? `
                                <div class="detail-item" data-platform="link" data-value="${contact.link}">
                                    <div class="detail-icon">
                                        <a href="http://${contact.link}" target="_blank">
                                            <img src="img/link.png" alt="Link Icon" style="width: 24px; height: 24px;">
                                        </a>
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.link}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.tb ? `
                                <div class="detail-item" data-platform="tb" data-value="${contact.tb}">
                                    <div class="detail-icon">
                                        <img src="img/tb.png" alt="Thunderbolt Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.tb}</div>
                                    </div>
                                </div>
                            ` : ''}
			${contact.onion ? `
			    <div class="detail-item" data-platform="onion" data-value="${contact.onion}">
				<div class="detail-icon">
				    <a href="http://${contact.onion}" target="_blank">
					<img src="img/onion.png" alt="Onion Icon" style="width: 24px; height: 24px;">
				    </a>
				</div>
				<div class="detail-content">
				    <div class="detail-label">${contact.onion}</div>
				</div>
			    </div>
			` : ''}
                            ${contact.sn ? `
                                <div class="detail-item" data-platform="sn" data-value="${contact.sn}">
                                    <div class="detail-icon">
                                        <img src="img/sn.png" alt="Signal Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.sn}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.mail ? `
                                <div class="detail-item" data-platform="mail" data-value="${contact.mail}">
                                    <div class="detail-icon">
                                        <img src="img/mail.png" alt="Mail Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.mail}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.gh ? `
                                <div class="detail-item" data-platform="gh" data-value="${contact.gh}">
                                    <div class="detail-icon">
                                        <img src="img/gh.png" alt="GitHub Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.gh}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.ig ? `
                                <div class="detail-item" data-platform="ig" data-value="${contact.ig}">
                                    <div class="detail-icon">
                                        <img src="img/ig.png" alt="Instagram Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.ig}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.fb ? `
                                <div class="detail-item" data-platform="fb" data-value="${contact.fb}">
                                    <div class="detail-icon">
                                        <img src="img/fb.png" alt="Facebook Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">Facebook</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.yt ? `
                                <div class="detail-item" data-platform="yt" data-value="${contact.yt}">
                                    <div class="detail-icon">
                                        <img src="img/yt.png" alt="YouTube Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">YouTube</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.rumble ? `
                                <div class="detail-item" data-platform="rumble" data-value="${contact.rumble}">
                                    <div class="detail-icon">
                                        <img src="img/rumble.png" alt="Rumble Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">Rumble</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.ens ? `
                                <div class="detail-item" data-platform="ens" data-value="${contact.ens}">
                                    <div class="detail-icon">
                                        <img src="img/ens.png" alt="ENS Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.ens}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.nostr ? `
                                <div class="detail-item" data-platform="nostr" data-value="${contact.nostr}">
                                    <div class="detail-icon">
                                        <img src="img/nostr.png" alt="Nostr Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.nostr}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.pk ? `
                                <div class="detail-item" data-platform="pk" data-value="${contact.pk}">
                                    <div class="detail-icon">
                                        <img src="img/pkdns.png" alt="pkdns Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">pkdns</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.matrix ? `
                                <div class="detail-item" data-platform="matrix" data-value="${contact.matrix}">
                                    <div class="detail-icon">
                                        <img src="img/matrix.png" alt="Matrix Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.matrix}</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.sx ? `
                                <div class="detail-item" data-platform="sx" data-value="${contact.sx}">
                                    <div class="detail-icon">
                                        <img src="img/simplex.png" alt="SimpleX Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">SimpleX</div>
                                    </div>
                                </div>
                            ` : ''}
                            ${contact.bsky ? `
                                <div class="detail-item" data-platform="bsky" data-value="${contact.bsky}">
                                    <div class="detail-icon">
                                        <img src="img/bsky.png" alt="Bluesky Icon" style="width: 24px; height: 24px;">
                                    </div>
                                    <div class="detail-content">
                                        <div class="detail-label">${contact.bsky}</div>
                                    </div>
                                </div>
                            ` : ''}
                            <div class="detail-item" data-platform="actions">
                                <div class="detail-content">
                                    <div class="crypto-row">
                                        <div class="crypto-icons">
                                            ${(contact.btc || contact.ln || contact.hns || contact.eth || contact.xmr || contact.zec || contact.bat) ? `
                                                ${contact.btc ? `
                                                    <img src="img/btc.png" alt="Bitcoin Icon" class="crypto-icon" data-platform="btc" data-value="${contact.btc}">
                                                ` : ''}
                                                ${contact.ln ? `
                                                    <img src="img/ln.png" alt="Lightning Icon" class="crypto-icon" data-platform="ln" data-value="${contact.ln}">
                                                ` : ''}
                                                ${contact.hns ? `
                                                    <img src="img/hns.png" alt="HNS Icon" class="crypto-icon" data-platform="hns" data-value="${contact.hns}">
                                                ` : ''}
                                                ${contact.eth ? `
                                                    <img src="img/eth.png" alt="Ethereum Icon" class="crypto-icon" data-platform="eth" data-value="${contact.eth}">
                                                ` : ''}
                                                ${contact.xmr ? `
                                                    <img src="img/xmr.png" alt="Monero Icon" class="crypto-icon" data-platform="xmr" data-value="${contact.xmr}">
                                                ` : ''}
                                                ${contact.zec ? `
                                                    <img src="img/zec.png" alt="Zcash Icon" class="crypto-icon" data-platform="zec" data-value="${contact.zec}">
                                                ` : ''}
                                                ${contact.bat ? `
                                                    <img src="img/bat.png" alt="BAT Icon" class="crypto-icon" data-platform="bat" data-value="${contact.bat}">
                                                ` : ''}
                                            ` : ''}
                                        </div>
                                        <button class="remove-contact-btn" data-domain="${contact.domain}">
                                            Remove Contact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                `;
            }

            function saveContacts() {
                localStorage.setItem('dcall-contacts', JSON.stringify(contacts));
            }

            function backupContacts() {
                const dataStr = JSON.stringify(contacts);
                const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
                const exportName = 'dcall-contacts-backup.json';

                const link = document.createElement('a');
                link.setAttribute('href', dataUri);
                link.setAttribute('download', exportName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            function restoreContacts() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';

                input.onchange = async (e) => {
                    const file = e.target.files[0];
                    if (!file) {
                        alert('No file selected');
                        return;
                    }

                    try {
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                            try {
                                const restoredContacts = JSON.parse(event.target.result);
                                if (!Array.isArray(restoredContacts)) {
                                    throw new Error('Invalid file format');
                                }

                                // Validate and update each restored contact
                                const updatePromises = restoredContacts.map(async (contact) => {
                                    try {
                                        const txtRecords = await fetchTXTRecords(contact.domain);
                                        if (txtRecords) {
                                            return {
                                                domain: contact.domain,
                                                phone: getRecordValue(txtRecords, 'tel') || contact.phone,
                                                pfp: getRecordValue(txtRecords, 'pfp') || contact.pfp,
                                                wa: getRecordValue(txtRecords, 'wa') || contact.wa,
                                                tg: getRecordValue(txtRecords, 'tg') || contact.tg,
                                                x: getRecordValue(txtRecords, 'x') || contact.x,
                                                url: getRecordValue(txtRecords, 'url') || contact.url,
                                                link: getRecordValue(txtRecords, 'link') || contact.link,
                                                tb: getRecordValue(txtRecords, 'tb') || contact.tb,
                                                onion: getRecordValue(txtRecords, 'onion') || contact.onion,
                                                sn: getRecordValue(txtRecords, 'sn') || contact.sn,
                                                mail: getRecordValue(txtRecords, 'mail') || contact.mail,
                                                gh: getRecordValue(txtRecords, 'gh') || contact.gh,
                                                ig: getRecordValue(txtRecords, 'ig') || contact.ig,
                                                fb: getRecordValue(txtRecords, 'fb') || contact.fb,
                                                yt: getRecordValue(txtRecords, 'yt') || contact.yt,
                                                rumble: getRecordValue(txtRecords, 'rumble') || contact.rumble,
                                                ens: getRecordValue(txtRecords, 'ens') || contact.ens,
                                                nostr: getRecordValue(txtRecords, 'nostr') || contact.nostr,
                                                pk: getRecordValue(txtRecords, 'pk') || contact.pk,
                                                matrix: getRecordValue(txtRecords, 'matrix') || contact.matrix,
                                                sx: getRecordValue(txtRecords, 'sx') || contact.sx,
                                                bsky: getRecordValue(txtRecords, 'bsky') || contact.bsky,
                                                btc: getRecordValue(txtRecords, 'btc') || null,
                                                ln: getRecordValue(txtRecords, 'ln') || null,
                                                hns: getRecordValue(txtRecords, 'hns') || null,
                                                eth: getRecordValue(txtRecords, 'eth') || null,
                                                xmr: getRecordValue(txtRecords, 'xmr') || null,
                                                zec: getRecordValue(txtRecords, 'zec') || null,
                                                bat: getRecordValue(txtRecords, 'bat') || null,
                                                lastUpdated: new Date().toISOString()
                                            };
                                        }
                                        return contact;
                                    } catch (error) {
                                        console.error(`Error updating ${contact.domain}:`, error);
                                        return contact;
                                    }
                                });

                                contacts = await Promise.all(updatePromises);
                                lastUpdate = new Date().toISOString();
                                localStorage.setItem('dcall-last-update', lastUpdate);
                                updateLastUpdateDisplay();
                                saveContacts();
                                renderContacts();
                                alert('Contacts restored and updated successfully!');
                            } catch (error) {
                                alert('Error restoring contacts: ' + error.message);
                            }
                        };
                        reader.readAsText(file);
                    } catch (error) {
                        alert('Error reading file: ' + error.message);
                    }
                };

                input.click();
            }

            function clearAllData() {
                if (confirm('Are you sure you want to clear all contacts and data? This cannot be undone.')) {
                    contacts = [];
                    lastUpdate = null;
                    localStorage.removeItem('dcall-contacts');
                    localStorage.removeItem('dcall-last-update');
                    updateLastUpdateDisplay();
                    renderContacts();
                    alert('All data cleared successfully!');
                }
            }

function copyToClipboard(text) {
    // Try using the Clipboard API first
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard: ' + text);
        }).catch(err => {
            console.error('Error copying to clipboard:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        // Fallback for browsers that don't support Clipboard API
        fallbackCopyToClipboard(text);
    }
}

function fallbackCopyToClipboard(text) {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        // Try using the deprecated execCommand method
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Copied to clipboard: ' + text);
        } else {
            alert('Failed to copy to clipboard. Please copy manually: ' + text);
        }
    } catch (err) {
        console.error('Error copying to clipboard:', err);
        alert('Failed to copy to clipboard. Please copy manually: ' + text);
    } finally {
        document.body.removeChild(textarea);
    }
}

            async function fetchTXTRecords(domain) {
                const cacheBuster = new Date().getTime();
                const url = `https://doh.hnsdns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT&_=${cacheBuster}`;
                
                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: { 'Accept': 'application/dns-json' },
                        cache: 'no-store'
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                    }

                    const data = await response.json();
                    console.log("DNS Response:", data);

                    if (data.Answer && data.Answer.length > 0) {
                        return data.Answer
                            .filter(record => record.type === 16)
                            .map(record => record.data.replace(/"/g, ''));
                    } else {
                        console.error("No TXT records found in DNS response.");
                        return null;
                    }
                } catch (error) {
                    console.error("Fetch Error:", error);
                    return null;
                }
            }
        });
    </script>
        <script>
        // Register the service worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('Service Worker registered with scope:', registration.scope);
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }
