const $ = document.querySelector.bind(document);
const canvas = $('#preview');
const fileInput = $('input[type="file"]') ;

const context = canvas.getContext('2d', { willReadFrequently: true });

//////////
var RateScale =  3 //tỉ lệ ảnh ASCII (1/RateScale)
//////////

fileInput.onchange = (e) => {
    console.log(e);

    const file = e.target.files[0];

    const reader = new FileReader(); //tạo reader để đọc img

    reader.onload = (event) => { //khi file đc tải lên
        const image = new Image(); //tạo img để đọc ảnh
        image.onload = () => { //khi ảnh đc tải lên

            //đặc chiều dài và rộng cho canvas bằng với ảnh
            canvas.width = image.width;
            canvas.height = image.height;

            console.log(RateScale);
            
            context.drawImage(image, 0, 0); //vẽ ảnh vào canvas

            //đưa context chứa img vào để sử lí - giá trị trả về được chuyển vào biến
            const result = convertToGrayScales(context, image.width, image.height);

            console.log(result.length);

            //gọi map để render ảnh ASCII
            map(result, image.width);

        }
        console.log(event.target.result);
        image.src = event.target.result; //đường dẫn ảnh
    }
    reader.readAsDataURL(file); //đường dẫn file dưới dạng data URL
}


function createGIF(URL) {
    const reader = new FileReader(); //tạo reader để đọc img

    const image = new Image(); //tạo img để đọc ảnh
    image.onload = () => { //khi ảnh đc tải lên

        //đặc chiều dài và rộng cho canvas bằng với ảnh
        canvas.width = image.width;
        canvas.height = image.height;

        console.log(RateScale);
        
        context.drawImage(image, 0, 0); //vẽ ảnh vào canvas

        //đưa context chứa img vào để sử lí - giá trị trả về được chuyển vào biến
        const result = convertToGrayScales(context, image.width, image.height);

        console.log(result.length);

        //gọi map để render ảnh ASCII
        map(result, image.width);

    }
    image.src = URL; //đường dẫn ảnh
}


//tỉ lệ màu chuyển sang xám - trả về 1 giá trị duy nhất - từ 0 đến 255
//0: đen - 255: trắng
const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

const convertToGrayScales = (context, width, height) => {

    // Lấy data image từ canvas tại tọa độ [0,0]
    // với chiều rộng và chiều cao
    const imageData = context.getImageData(0, 0, width, height);
    console.log(imageData);

    const grayScales = [];

    for (let i = 0; i < imageData.data.length; i += 4) { 
        // có 3 màu cơ bản nên phải +4 để lên bộ màu tiếp theo     
    
        //lấy 3 màu cơ bản của mỗi pixel
        const r = imageData.data[i];     //0
        const g = imageData.data[i + 1]; //1
        const b = imageData.data[i + 2]; //2

        //đưa bộ 3 màu vào funtion để chuyển sang màu xám
        const grayScale = toGrayScale(r, g, b);

        //thay đổi pixel tại data i thành màu mới 
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;

        //thêm giá trị vào mảng
        grayScales.push(grayScale);
    }

    // Vẽ lại một bức ảnh dựa trên image data mới,
    // bắt đầu tại tọa độ [0,0]
    context.putImageData(imageData, 0, 0);


    //trả về mảng chứa data của ảnh đã chuyển sang thang xám
    return grayScales;
}

const pre = $('#pre');
const grayRamp = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const rampLength = grayRamp.length;

var GIF_DATA_FRAMES = [];


//nhận vào 1 giá trị grayScale và trả về 1 kí tự tương ứng
const getCharacterForGrayScale = (grayScale) => grayRamp[Math.ceil(((rampLength - 1) * grayScale) / 255)];
////////////////////////////////////////////////////////////////////
const map = (grayScales, width) => {
    let count = 0
    //map ra 1 mảng chứa toàn bộ kí tự được chuyển
    const mapASCII = grayScales.map((data, index) => {
        //giảm chất lượng ảnh theo ScaleRate
        if(count % RateScale == 0) {
            if((index + 1) % width == 0 ) { //tới max width thì + \n để xuống dòng
                
                count++
                return getCharacterForGrayScale(data) + '\n';
                
            }
            if(index % RateScale == 0) {
                return getCharacterForGrayScale(data);
            }
        }
        if((index + 1) % width == 0 ) count++;
        
    }).join('') //.join('') xóa các dấu , và dấu '' trong mảng


    //add mảng vào textBox
    GIF_DATA_FRAMES.push(mapASCII);

    console.log(mapASCII.length);
    console.log(GIF_DATA_FRAMES.length);
}

var count = 0;
setInterval(() => {
    if(GIF_DATA_FRAMES) {
        if(count >= GIF_DATA_FRAMES.length) count = 0;
        pre.textContent = GIF_DATA_FRAMES[count];
        count++;
    }
}, 50);



function gifShow() {
    var count_ImgLoad = 0
    var index_Img;
    var delay;
    setInterval(() => {
        if(count_ImgLoad < 67) {
            if(count_ImgLoad < 10) {
                index_Img = '0' + `${count_ImgLoad}`
            } else {
                index_Img = `${count_ImgLoad}`;
            }
            if(count_ImgLoad % 2 == 0) {
                delay = '0.05';
            } else {
                delay = '0.03';
            }
            createGIF(`./Resource/frame_${index_Img}_delay-${delay}s.gif`);
            count_ImgLoad++;
        }
    }, 50); 
}