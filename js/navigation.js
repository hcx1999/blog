// 专门用于处理导航的辅助功能
(function() {
    // 在DOM加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        // 为所有带有data-action属性的导航元素添加事件监听器
        document.querySelectorAll('[data-action]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                const action = this.getAttribute('data-action');
                
                switch(action) {
                    case 'home':
                        window.showHome();
                        break;
                    case 'about':
                        window.showAbout();
                        break;
                    default:
                        console.warn('未知的导航操作:', action);
                }
                
                return false;
            });
        });
        
        // 检测是否需要显示首页
        setTimeout(function() {
            const activeView = document.querySelector('.view.active');
            if (!activeView) {
                console.warn('没有激活的视图，强制显示首页');
                showHomeDirect();
            }
        }, 2000);
    });
    
    // 直接操作DOM显示首页的备用函数
    window.showHomeDirect = function() {
        document.querySelectorAll('.view').forEach(function(view) {
            view.classList.remove('active');
        });
        const homeView = document.getElementById('home-view');
        if (homeView) {
            homeView.classList.add('active');
            document.body.className = document.body.className.replace(/view-\w+/g, '');
            document.body.classList.add('view-home');
            return true;
        }
        return false;
    };
    
    // 直接操作DOM显示关于页的备用函数
    window.showAboutDirect = function() {
        document.querySelectorAll('.view').forEach(function(view) {
            view.classList.remove('active');
        });
        const aboutView = document.getElementById('about-view');
        if (aboutView) {
            aboutView.classList.add('active');
            document.body.className = document.body.className.replace(/view-\w+/g, '');
            document.body.classList.add('view-about');
            return true;
        }
        return false;
    };
})();
