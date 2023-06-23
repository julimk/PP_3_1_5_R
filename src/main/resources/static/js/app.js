const allUsersTable = $('#allUsersTable')
let editModalForm = document.forms['editModalForm']
let deleteModalForm = document.forms['deleteModalForm']
let newUserForm = document.forms['newUserForm']

$(async function () {
    await getAuthenticatedUser()
    await fillUsersTable()
    addUser()
    editUser()
    deleteUser()
})

async function getUser(id) {
    let response = await fetch('/api/admin/' + id)
    return await response.json()
}

async function fillModalForm(form, modal, id) {
    modal.show()
    let user = await getUser(id)
    form.id.value = user.id
    form.roles.value = user.roles[0].id
    form.login.value = user.login
    form.firstName.value = user.name
    form.lastName.value = user.lastName
    form.age.value = user.age
    form.email.value = user.email
}


// Filling Users Table
function fillUsersTable() {
    allUsersTable.empty()
    fetch('/api/admin')
        .then(res => res.json())
        .then(data =>
            data.forEach(user => {
                    let tableRow = `$(
                    <tr>
                            <td>${user.id}</td>
                            <td>${user.login}</td>
                            <td>${user.name}</td>
                            <td>${user.lastName}</td>
                            <td>${user.age}</td>   
                            <td>${user.email}</td>
                            <td>${user.roles.map(role => ' ' + role.authority.substring(5))}</td>
                            <td>
                                <button type="button" class="btn btn-info"
                                data-bs-toogle="modal"
                                data-bs-target="#editModal"
                                onclick="openEditModal(${user.id})">Edit</button>
                            </td>
                            <td>
                                <button type="button" class="btn btn-danger" 
                                data-toggle="modal"
                                data-bs-target="#deleteModal"
                                onclick="openDeleteModal(${user.id})">Delete</button>
                            </td>
                        </tr>)`
                    allUsersTable.append(tableRow)
                }
            ))
}

// Editing User
async function openEditModal(id) {
    const modal = new bootstrap.Modal(document.querySelector('#editModal'))
    await fillModalForm(editModalForm, modal, id)
}

function editUser() {
    editModalForm.addEventListener('submit', event => {
        event.preventDefault()
        let editedUserRoles = []
        for (let i = 0; i < editModalForm.roles.options.length; i++) {
            if (editModalForm.roles.options[i].selected) {
                editedUserRoles.push({
                    id: editModalForm.roles.options[i].value,
                    authority: 'ROLE_' + editModalForm.roles.options[i].text
                })
            }
        }

        fetch('/api/admin', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: editModalForm.id.value,
                roles: editedUserRoles,
                name: editModalForm.firstName.value,
                lastName: editModalForm.lastName.value,
                age: editModalForm.age.value,
                login: editModalForm.login.value,
                email: editModalForm.email.value,
                password: editModalForm.password.value
            })
        }).then(() => {
            $('#editModalCloseButton').click()
            fillUsersTable()
        })
    })
}

// User Deletion
async function openDeleteModal(id) {
    const modal = new bootstrap.Modal(document.querySelector('#deleteModal'))
    await fillModalForm(deleteModalForm, modal, id)
    switch (deleteModalForm.roles.value) {
        case '2':
            deleteModalForm.roles.value = 'USER'
            break
        case '1':
            deleteModalForm.roles.value = 'ADMIN'
            break

    }
}

function deleteUser() {
    deleteModalForm.addEventListener("submit", event => {
        event.preventDefault()
        fetch("/api/admin/" + deleteModalForm.id.value, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            $('#deleteModalCloseButton').click()
            fillUsersTable()
        })
    })
}


// Add New User
function addUser() {
    newUserForm.addEventListener('submit', event => {
        event.preventDefault()
        let newUserRoles = []
        for (let i = 0; i < newUserForm.roles.options.length; i++) {
            if (newUserForm.roles.options[i].selected) {
                newUserRoles.push({
                    id: newUserForm.roles.options[i].value,
                    authority: "ROLE_" + newUserForm.roles.options[i].text
                })
            }
        }
        console.log(newUserRoles);
        fetch('/api/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: newUserForm.id.value,
                roles: newUserRoles,
                name: newUserForm.firstName.value,
                lastName: newUserForm.lastName.value,
                age: newUserForm.age.value,
                login: newUserForm.login.value,
                email: newUserForm.email.value,
                password: newUserForm.password.value
            })
        }).then(() => {
            newUserForm.reset()
            fillUsersTable()
            $('#users-tab').click()
        })
    })
}

// Get Authenticated User
function getAuthenticatedUser() {
    fetch('api/user')
        .then(res => res.json())
        .then(data => {
            $('#authenticatedUserLogin').append(data.login);
            let roles = data.roles.map(role => ' ' + role.authority.substring(5))
            $('#authenticatedUserRoles').append(roles)
            let user = `$(
                <tr>
                    <td>${data.id}</td>
                    <td>${data.login}</td>
                    <td>${data.name}</td>
                    <td>${data.lastName}</td>
                    <td>${data.age}</td>
                    <td>${data.email}</td>
                    <td>${roles}</td>
                </tr>)`
            $('#authenticatedUserTable').append(user)
        })
}