import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM convidados ORDER BY date DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar convidados", error);
    return NextResponse.json({ error: "Erro ao listar convidados" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const payload = await req.json();
  const nome: string | undefined = payload?.nome;
  const vai: boolean | undefined = payload?.vai;
  const acompanhantes: number = Number(payload?.acompanhantes ?? 0);

  if (!nome || typeof nome !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  if (typeof vai !== "boolean") {
    return NextResponse.json({ error: "Campo 'vai' deve ser booleano" }, { status: 400 });
  }

  if (Number.isNaN(acompanhantes) || acompanhantes < 0) {
    return NextResponse.json({ error: "Acompanhantes deve ser um número positivo" }, { status: 400 });
  }

  try {
    const result = await query(
      "INSERT INTO convidados (nome, vai, acompanhantes) VALUES ($1, $2, $3) RETURNING *",
      [nome.trim(), vai, acompanhantes]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar convidado", error);
    return NextResponse.json({ error: "Erro ao criar convidado" }, { status: 500 });
  }
}
