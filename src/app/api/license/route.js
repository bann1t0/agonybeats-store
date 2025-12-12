import { NextResponse } from 'next/server';
import { generateLicenseTXT } from '@/lib/licenseTemplates';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const beatTitle = searchParams.get('beatTitle');
    const buyerName = searchParams.get('buyerName');
    const licenseType = searchParams.get('licenseType');
    const date = searchParams.get('date') || new Date().toLocaleDateString();

    if (!beatTitle || !buyerName) {
        return new NextResponse('Missing parameters', { status: 400 });
    }

    const txt = generateLicenseTXT({
        beatTitle,
        buyerName,
        licenseType: licenseType || 'Basic Lease',
        date
    });

    return new NextResponse(txt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="${beatTitle} - ${licenseType} License.txt"`
        }
    });
}
