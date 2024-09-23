const express = require('express');
const app = express();
const port = 8080;
const webpush = require('web-push');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');

app.use(cors({
    origin: "*",
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
//

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

    // Gửi thông báo cho tất cả subscriptions
    subscriptions.forEach(subscription => {
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});