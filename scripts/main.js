import fetch from 'node-fetch';

async function getRoutesData() {
    try {
        const response = await fetch('http://192.168.3.7:6688/all');
        const data = await response.json();
        return data.routes;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}


import mysql from 'mysql2/promise';

getRoutesData().then(async routesData => {
    if (!routesData) {
        console.error('No routes data available');
        return;
    }
    
    console.log('Found routes:', routesData);
    
    // 创建数据库连接
    const connection = await mysql.createConnection({
        host: '192.168.3.7',
        port: 3306,
        user: 'root',
        password: 'mysql_eKSxTr',
        database: 'DailyHotApi'
    });
    
    console.log('Database connection established');
    
    // 遍历所有节点并请求每个路径
    for (const route of routesData) {
        try {
            const url = `http://192.168.3.7:6688${route.path}`;
            console.log(`Requesting: ${url}`);
            
            const response = await fetch(url);
            const data = await response.json();
            
            // console.log(`Response from ${route.path}:`, data);
            
            // 将数据写入数据库
            const [result] = await connection.execute(
                'INSERT INTO dailyHot (type, data) VALUES (?, ?)',
                [route.name, data]
            );
            
            console.log(`Data from ${route.name} saved to database, insertId: ${result.insertId}`);
        } catch (error) {
            console.error(`Error processing ${route.path}:`, error);
        }
    }
    
    // 关闭数据库连接
    await connection.end();
    console.log('Database connection closed');
});

