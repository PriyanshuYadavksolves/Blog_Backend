module.exports = ({ coverImg, blogTitle, userPic, userName, blogId }) => {
  return `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    
    </head>
    
    <body>
    <div class="" style=" max-width: 480px; margin: 0px auto; border: 2px solid black; padding:20px 20px; border-radius: 10px;">
    <span class="" style=" font-size: 40px; display: block; 
    text-align: center;
    border-bottom: 2px solid black;">Tridium Daily Quist</span>
    <p style="font-weight: bold;font-size: 16px;
    font-family: monospace;
    font-weight: bold;
    letter-spacing: 5px; ">New Blog</p>
    
            <img class="" style="display: block; width: 100%; border-radius: 10px; margin: 0px auto;
    object-fit: contain;" src="${coverImg}" alt="${coverImg}">
    
            <h2><a href="http://ec2-13-126-44-183.ap-south-1.compute.amazonaws.com:3000/blog/${blogId}" style=" text-decoration: none; color: blue;">
                   ${blogTitle}
                </a> </h2>
    
                <div>
                <img src="${userPic}"
                    alt="${userPic}" height="50px" width="50px" style="border-radius: 50%; display: inline-block; vertical-align: middle;">
                <span style="font-weight: bold; margin-left: 20px; vertical-align: middle;">${userName}</span>
    
            </div>
    
    
            <img height="50px" style="margin: 0px auto; margin-top: 20px; width: auto; display: block;"
                src="https://www.lonmark.org/wp-content/uploads/ultimatemember/33/profile_photo.png?1710641004"
                alt="Tridium">
            <span style="display:block; text-align: center;">See more of what you like and less of what you dont.
            </span>
    
        </div>
    </body>
    
    </html>`;
};
