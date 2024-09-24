const express = require('express');
const app = express();
const port = 8080;
const webpush = require('web-push');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const {Server} = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
app.use(cors({
    origin: "*",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
//socket
const clients = {};
io.on('connection', async (socket) => {
    console.log('Người dùng kết nối:', socket.id);
    const userId = socket.handshake.auth.user_id;
    socket.join(userId);
    // Khi client đăng ký nhận thông báo
    // Khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Người dùng ngắt kết nối', socket.id);
    });
});


//end socket

const publicVapidKey = 'BE3x0_ETgiAiwzBZm0woOQRy2ZU4mKqGzt0uyqmvwhVJzEmfypVmR6cJKMFPv0G5q4zTb9hl-ETJwDUU-1cNNtM';
const privateVapidKey = 'LWp5DWvoyAVu1VhRdj-biTChk5F-XYI4Z4xgTGDiAJY';
webpush.setVapidDetails(
    'mailto:datkt.novaedu@gmail.com',
    publicVapidKey,
    privateVapidKey
);
let subscriptions = []; // Đây là nơi lưu trữ các subscription

app.post('/subscribe', (req, res) => {
    const subscription = req.body;

    // Lưu subscription nếu chưa có
    // Kiểm tra xem subscription đã tồn tại chưa
    const exists = subscriptions.find(sub => sub.endpoint === subscription.endpoint);

    if (!exists) {
        // Lưu subscription nếu chưa có
        subscriptions.push(subscription);
    }

    // Trả về trạng thái thành công
    res.status(201).json({});

});
app.post('/send-notification', (req, res) => {
    const payload = JSON.stringify({
        title: 'Thông báo mới!',
        body: 'Chào mừng bạn đến với ứng dụng của chúng tôi!',
        data: {
            url: 'http://localhost:5173/test'
        }
    });
    let {new_task, subscription, user_id} = req.body;
    console.log(new_task)
    // Gửi thông báo cho người dùng đang online
    io.sockets.sockets.forEach((socket) => {
        if (socket?.handshake?.auth?.user_id !== user_id) {
            socket.emit('notification', new_task);
        }
    });
    // Gửi thông báo cho tất cả subscriptions
    let newSubscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
    newSubscriptions.forEach(subscription => {
        webpush.sendNotification(subscription, payload).catch(error => {
            console.error('Lỗi khi gửi thông báo:', error);
        });
    });
    res.status(200).json({message: 'Thông báo đã được gửi tới tất cả người dùng!'});
});

//

app.get('/', (req, res) => {
    res.send('Hello World');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});