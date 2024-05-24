document.addEventListener('DOMContentLoaded', (event) => {
    checkAuth();
});

function login() {
    const username = document.getElementById('username').value;
    if (username.trim() !== '') {
        localStorage.setItem('currentUser', username);
        checkAuth();
    } else {
        alert('Por favor, insira seu nome para entrar no fórum.');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    checkAuth();
}

function checkAuth() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('forumContainer').style.display = 'block';
        loadPosts();
    } else {
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('forumContainer').style.display = 'none';
    }
}

function getCurrentUser() {
    return localStorage.getItem('currentUser');
}

function addPost() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Você precisa inserir seu nome para postar mensagens.');
        return;
    }

    const postContent = document.getElementById('postContent').value;
    const postImageInput = document.getElementById('postImage');
    const postImage = postImageInput.files[0];

    if (postContent.trim() === '' && !postImage) {
        alert('Por favor, escreva uma mensagem ou escolha uma imagem antes de postar.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = function() {
        const post = {
            id: Date.now(), // Usando timestamp como ID
            author: currentUser,
            content: postContent,
            image: reader.result,
            timestamp: new Date().toISOString()
        };
        savePost(post);
        appendPost(post);
        document.getElementById('postContent').value = '';
        postImageInput.value = ''; // Limpa o input de arquivo
    };

    if (postImage) {
        reader.readAsDataURL(postImage); // Converte a imagem para base64
    } else {
        reader.onloadend(); // Chama imediatamente se não houver imagem
    }
}

function deletePost(id) {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Você precisa inserir seu nome para apagar mensagens.');
        return;
    }

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(post => post.id === id);
    if (!post) {
        alert('A mensagem não foi encontrada.');
        return;
    }
    if (post.author !== currentUser) {
        alert('Você não tem permissão para apagar esta mensagem.');
        return;
    }

    posts = posts.filter(post => post.id !== id);
    localStorage.setItem('posts', JSON.stringify(posts));
    document.querySelector(`.post[data-id="${id}"]`).remove();
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.forEach(post => appendPost(post));
}

function savePost(post) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function appendPost(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.dataset.id = post.id;
    postDiv.innerHTML = `
        <p><strong>${post.author}</strong>: ${post.content}</p>
        ${post.image ? `<img src="${post.image}" />` : ''}
        ${post.author === getCurrentUser() ? `<button onclick="deletePost(${post.id})">Apagar</button>` : ''}
    `;
    
    document.getElementById('posts').appendChild(postDiv);
}
