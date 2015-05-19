SPICEWORKS.app.dashboard.addWidgetType({
    name: 'Chris_FIT_Ticket_Schedule',
    label: 'FIT Ticket Schedule',
    icon: '/settings/plugins/148/content/rsz_calendar53.png',
    update: function (element) {

        var renderHTML = function () {

            var sectionBorderStyle = "thin solid #000",
                today = new Date(),
                tomorrow = new Date(),
                tenDays = new Date();

            tomorrow.setDate(tomorrow.getDate() + 1);
            tenDays.setDate(tenDays.getDate() + 10);

            // Destroy any existing report table rows.
            var rptTable = document.getElementById('rptTable');
            
            // Initialize report table element.
            if (rptTable) {
                while (rptTable.firstChild) {
                    rptTable.removeChild(rptTable.firstChild);
                }
            } else {
                rptTable = new Element('table');
                rptTable.setAttribute('id', 'rptTable');
                rptTable.setAttribute('class', 'container');
                element.update(rptTable);
            }

            // Ticket query.
            chrisjsherm.getTickets.then(function (result) {

                var tickets = result,
                    odTickets = [],
                    tdTickets = [],
                    tmTickets = [],
                    ucTickets = [],
                    ndTickets = [];

                tickets.each(function (ticket) {

                    if (ticket.due_at) {

                        // Set correct date formats.
                        var tDueDate = ticket.due_at,
                            yr1 = tDueDate.substring(0, 4),
                            mt1 = tDueDate.substring(5, 7),
                            dt1 = tDueDate.substring(8, 10);

                        mt1 = mt1 - 1;
                        var ticketDueDate = new Date(yr1, mt1, dt1, 0, 0, 0, 0);
                        today.setHours(0, 0, 0, 0);
                        tomorrow.setHours(0, 0, 0, 0);

                        // Fix the year for display.
                        yr1 = yr1.substring(2);

                        // Fix the month for display.
                        mt1 = mt1 + 1;

                        // Fix the ticket due date for display.
                        ticket.ticketDueDate = (mt1 + "/" + dt1 + "/" + yr1);

                        if (ticketDueDate.getTime() < today.getTime()) {
                            odTickets.push(ticket);
                        } else if (ticketDueDate.getTime() === today.getTime()) {
                            tdTickets.push(ticket);
                        } else if (ticketDueDate.getTime() === tomorrow.getTime()) {
                            console.log('Ticket due date: ' + ticketDueDate.getTime() +
                                        '. Tomorrow time: ' + tomorrow.getTime());
                            tmTickets.push(ticket);
                        } else if ((ticketDueDate.getTime() > tomorrow.getTime()) && (ticketDueDate.getTime() < tenDays.getTime())) {
                            ucTickets.push(ticket);
                        }
                    } else {
                        ndTickets.push(ticket);
                    }
                });

                return {
                    odTickets: odTickets,
                    tdTickets: tdTickets,
                    tmTickets: tmTickets,
                    ucTickets: ucTickets,
                    ndTickets: ndTickets
                };
            }, function (err) {
                console.log(err);
            }).then(function (response) {

                /*
                 * Overdue tickets.
                 */
                chrisjsherm.composeSectionHeading('Overdue', rptTable, sectionBorderStyle, false);

                if (response.odTickets.length > 0) {

                    response.odTickets.sort(chrisjsherm.sortByDueDate);

                    response.odTickets.each(function (ticket) {
                        chrisjsherm.composeTicketRow(ticket, rptTable);
                    });
                } else {
                    chrisjsherm.composeNoRecordsDataRow(rptTable);
                }

                /*
                 * Today's tickets.
                 */
                chrisjsherm.composeSectionHeading('Today', rptTable, sectionBorderStyle, false);

                if (response.tdTickets.length > 0) {

                    response.tdTickets.sort(chrisjsherm.sortByNumbers);

                    response.tdTickets.each(function (ticket) {
                        chrisjsherm.composeTicketRow(ticket, rptTable);
                    });
                } else {
                    chrisjsherm.composeNoRecordsDataRow(rptTable);
                }

                /*
                 * Tomorrow's tickets.
                 */
                chrisjsherm.composeSectionHeading('Tomorrow', rptTable, sectionBorderStyle, false);

                if (response.tmTickets.length > 0) {

                    response.tmTickets.sort(chrisjsherm.sortByNumbers);

                    response.tmTickets.each(function (ticket) {
                        chrisjsherm.composeTicketRow(ticket, rptTable);
                    });
                } else {
                    chrisjsherm.composeNoRecordsDataRow(rptTable);
                }

                /*
                 * Upcoming tickets.
                 */
                chrisjsherm.composeSectionHeading('Upcoming', rptTable, sectionBorderStyle, false);

                if (response.ucTickets.length > 0) {

                    response.ucTickets.sort(chrisjsherm.sortByDueDate);

                    response.ucTickets.each(function (ticket) {
                        chrisjsherm.composeTicketRow(ticket, rptTable);
                    });
                } else {
                    chrisjsherm.composeNoRecordsDataRow(rptTable);
                }

                /*
                 * No due date tickets.
                 */
                chrisjsherm.composeSectionHeading('No due date', rptTable, sectionBorderStyle, false);

                if (response.ndTickets.length > 0) {

                    response.ndTickets.sort(chrisjsherm.sortByNumbers);

                    response.ndTickets.each(function (ticket) {
                        chrisjsherm.composeTicketRow(ticket, rptTable);
                    });
                } else {
                    chrisjsherm.composeNoRecordsDataRow(rptTable);
                }
            });
        };

        plugin.includeStyles();
        renderHTML();
        
        // Refresh every minute.
        var refreshTickets = (60000);
        setInterval(renderHTML, refreshTickets);
    }
});

window.chrisjsherm = window.chrisjsherm || {};

window.chrisjsherm.getTickets = new Promise(function (resolve, reject) {

    SPICEWORKS.data.query({ tickets: { class: 'Ticket', include: 'users', conditions: 'status="open"' } },
        function (results) {
            if (results.tickets) {
                resolve(results.tickets);
            } else {
                reject(Error('An error occurred while retrieving tickets.'));
            }
        }
    );
});

window.chrisjsherm.composeNoRecordsDataRow = function (reportTable) {

    var emptyRow = new Element('tr');
    reportTable.insert(emptyRow);
    emptyRow.update('<td colspan="4">No tickets</td>');
};

window.chrisjsherm.composeSectionHeading = function (category, reportTable, borderStyle, hasEmptyRowAbove) {

    if (hasEmptyRowAbove) {
        var emptyRow = new Element('tr');
        reportTable.insert(emptyRow);
        emptyRow.update('<td colspan="4" style="height: 10px !important;"></td>');
    }

    var titleRow = new Element('tr');
    reportTable.insert(titleRow);
    titleRow.update('<th colspan="4"><strong>' + category + '</strong></th>');
    titleRow.style.borderBottom = borderStyle;
};

window.chrisjsherm.composeTicketRow = function (ticket, reportTable) {

    // Create rows and columns.
    var row = new Element('tr');
    reportTable.insert(row);

    var col1 = new Element('td'),
        col2 = new Element('td'),
        col3 = new Element('td'),
        col4 = new Element('td');

    row.insert(col1);
    col1.update(ticket.id);
    row.insert(col2);
    col2.update('<a href="/tickets/list/single_ticket/' + ticket.id +
        '" >' + ticket.summary + '</a>');

    row.insert(col3);
    var assignedUser;

    /*
     * Find the user within the ticket's users array
     * whose Id property matches the ticket's
     * assigned to property.
     */
    ticket.users.each(function (user) {
        if (user.id === ticket.assigned_to) {
            assignedUser = user;
        }
    });

    // Insert the assigned to user's name.
    if (assignedUser) {
        col3.update(assignedUser.first_name +
        ' ' + assignedUser.last_name);
    }

    row.insert(col4);
    col4.update(ticket.ticketDueDate);
};

window.chrisjsherm.sortByDueDate = function (a, b) {

    var x = a.due_at,
        y = b.due_at;

    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};

window.chrisjsherm.sortByNumbers = function (a, b) {

    var x = a.id,
        y = b.id;

    return x - y;
};
​