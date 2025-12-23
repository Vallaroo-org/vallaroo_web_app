import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { text, targetLang } = body;

        if (!text || !targetLang) {
            return NextResponse.json(
                { error: 'Missing text or targetLang' },
                { status: 400 }
            );
        }

        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Translation API failed');
        }

        const data = await response.json();
        // data[0][0][0] contains the translated text
        const translatedText = data[0][0][0];

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
