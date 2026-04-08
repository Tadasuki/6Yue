// ====================
//   侧边栏折叠/展开逻辑
// ====================
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        toggleBtn.innerHTML = '❯'; 
    } else {
        toggleBtn.innerHTML = '❮'; 
    }
});