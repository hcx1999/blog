import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="min-h-[80vh] flex flex-col py-16">
        {/* 头像 */}
        <div className="mb-8 flex flex-col items-center">
          <img 
            src={`${import.meta.env.BASE_URL}avatar.svg`} 
            alt="&omega;" 
            className="w-24 h-24 mb-4 transition-transform duration-500 hover:rotate-360"
            style={{ transition: 'transform 0.5s ease-in-out' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'rotate(360deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          />
          <h1 className="text-2xl font-bold mb-2">&omega;</h1>
          
          {/* 联系方式 */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            <p>邮箱: 2300019816@stu.pku.edu.cn</p>
            <p>GitHub: @hcx1999</p>
          </div>
        </div>

        {/* 自我介绍 */}
        <div className="mb-12">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            我是&omega;，目前就读于北京大学信息科学技术学院，本科二年级，喜欢Linux开发、AI（CV和具身）、数学，以及一些奇奇怪怪的小东西。
          </p>
        </div>

        {/* 友链 */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">友链</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href="https://iculizhi.github.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <img src={`${import.meta.env.BASE_URL}xj.svg`} alt="ICUlizhi" className="w-12 h-12" />
              <div>
                <div className="font-medium">ICUlizhi</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">p大22级图灵班&经双，爱好中国哲学</div>
              </div>
            </a>
          </div>
        </div>

        {/* 页脚 */}
        <div className="mt-auto pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2026 hcx1999
          </p>
        </div>
      </div>
    </div>
  );
};
