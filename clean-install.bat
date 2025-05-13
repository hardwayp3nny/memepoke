@echo off
echo 正在清理项目...
echo 删除node_modules文件夹...
if exist node_modules (
  rmdir /s /q node_modules
) else (
  echo node_modules文件夹不存在，跳过删除
)

echo 删除package-lock.json...
if exist package-lock.json (
  del /f package-lock.json
) else (
  echo package-lock.json不存在，跳过删除
)

echo 安装依赖...
call npm install --legacy-peer-deps

echo 完成！
echo 现在可以运行 npm start 启动项目
pause 