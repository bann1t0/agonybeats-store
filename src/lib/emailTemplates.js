/**
 * Email Template for Order Confirmation
 * Beautiful HTML email with download links
 */

export function createOrderEmail(customerEmail, customerName, deliveredFiles, total) {
    const currentYear = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your AgonyBeats Order</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); color: #ffffff;">
    
    <!-- Main Container -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Email Card -->
                <table width="600" cellpadding="0" cellspacing="0" style="background: rgba(20, 20, 30, 0.95); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 2px;">
                                AGONYBEATS
                            </h1>
                            <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9); letter-spacing: 3px;">
                                SOUNDS FROM THE COSMOS
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Success Message -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <div style="display: inline-block; background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 50%; width: 80px; height: 80px; line-height: 76px; margin-bottom: 20px;">
                                <span style="font-size: 40px; color: #10b981;">✓</span>
                            </div>
                            <h2 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                                Payment Successful!
                            </h2>
                            <p style="margin: 0; font-size: 16px; color: #888;">
                                Hey ${customerName || 'there'}, your beats are ready to download
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Order Summary -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: rgba(0, 0, 0, 0.3); border-radius: 12px; padding: 25px; border: 1px solid rgba(255, 255, 255, 0.05);">
                                <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #ffffff; text-transform: uppercase; letter-spacing: 1px;">
                                    Your Downloads
                                </h3>
                                
                                ${deliveredFiles.map((item, idx) => `
                                    <div style="margin-bottom: ${idx < deliveredFiles.length - 1 ? '25px' : '0'}; padding-bottom: ${idx < deliveredFiles.length - 1 ? '25px' : '0'}; border-bottom: ${idx < deliveredFiles.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'};">
                                        <div style="margin-bottom: 12px;">
                                            <strong style="font-size: 16px; color: #ffffff;">${item.beatTitle}</strong>
                                            <span style="display: inline-block; margin-left: 10px; background: rgba(102, 126, 234, 0.2); color: #667eea; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                                                ${item.license}
                                            </span>
                                        </div>
                                        
                                        ${item.files.map(file => `
                                            <a href="${file.url}" 
                                               style="display: block; background: rgba(14, 165, 233, 0.1); border: 2px solid #0ea5e9; color: #0ea5e9; text-decoration: none; padding: 12px 20px; margin-bottom: 8px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.3s;">
                                                <span style="margin-right: 8px;">⬇</span> ${file.name}
                                            </a>
                                        `).join('')}
                                    </div>
                                `).join('')}
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Total -->
                    ${total > 0 ? `
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: rgba(102, 126, 234, 0.1); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(102, 126, 234, 0.3);">
                                <span style="font-size: 14px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Total Paid</span>
                                <div style="font-size: 32px; font-weight: 800; color: #667eea; margin-top: 5px;">
                                    €${total.toFixed(2)}
                                </div>
                            </div>
                        </td>
                    </tr>
                    ` : ''}
                    
                    <!-- Important Info -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                                <h4 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #f59e0b; text-transform: uppercase;">
                                    Important Information
                                </h4>
                                <ul style="margin: 0; padding-left: 20px; color: #ccc; font-size: 14px; line-height: 1.6;">
                                    <li>Download links are valid for <strong>30 days</strong></li>
                                    <li>Save files to your device immediately</li>
                                    <li>Read the LICENSE AGREEMENT for usage terms</li>
                                    <li>Need help? Contact us at support@agonybeats.com</li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- CTA Button -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px; text-align: center;">
                            <a href="${process.env.NEXTAUTH_URL || 'https://agonybeats.com'}" 
                               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 700; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                                Browse More Beats
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: rgba(0, 0, 0, 0.4); padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);">
                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #888;">
                                Thank you for your purchase!
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #666;">
                                © ${currentYear} AgonyBeats. All rights reserved.
                            </p>
                            <div style="margin-top: 20px;">
                                <a href="${process.env.NEXTAUTH_URL}" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px;">Website</a>
                                <span style="color: #444;">|</span>
                                <a href="${process.env.NEXTAUTH_URL}/contact" style="color: #667eea; text-decoration: none; margin: 0 10px; font-size: 12px;">Support</a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                
            </td>
        </tr>
    </table>
    
</body>
</html>
    `.trim();
}
