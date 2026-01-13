import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT p.*, c.nome AS convidado_nome
       FROM presentes p
       LEFT JOIN convidados c ON c.id = p.idConvidado
       ORDER BY p.data DESC NULLS LAST`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao listar presentes", error);
    return NextResponse.json({ error: "Erro ao listar presentes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const payload = await req.json();
  const nome: string | undefined = payload?.nome;
  const idConvidado: number | null = payload?.idConvidado ?? null;

  if (!nome || typeof nome !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const result = await query(
      "INSERT INTO presentes (nome, idConvidado, data) VALUES ($1, $2, CURRENT_DATE) RETURNING *",
      [nome.trim(), idConvidado]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar presente", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Convidado já possui presente vinculado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar presente" }, { status: 500 });
  }
}
