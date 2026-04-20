import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    
    // Szigorúan szerveroldali környezeti változók lekérése
    const envUser = process.env.ADMIN_NAME;
    const envPass = process.env.ADMIN_PASSWORD;

    if (!envUser || !envPass) {
      return NextResponse.json({ 
        success: false, 
        error: 'Környezeti változók nincsenek beállítva a Vercelen (ADMIN_NAME, ADMIN_PASSWORD)!' 
      }, { status: 500 });
    }

    // Név és Jelszó ellenőrzése
    if (username === envUser && password === envPass) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Helytelen felhasználónév vagy jelszó!' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Szerverhiba történt a belépés során.' }, { status: 500 });
  }
}
