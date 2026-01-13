import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type Params = { params: { id: string } };

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
};

export async function GET(_req: Request, { params }: Params) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const result = await query(
      `SELECT p.*, c.nome AS convidado_nome
       FROM presentes p
       LEFT JOIN convidados c ON c.id = p.idConvidado
       WHERE p.id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Presente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar presente", error);
    return NextResponse.json({ error: "Erro ao buscar presente" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const payload = await req.json();
  const nome: string | undefined = payload?.nome;
  const idConvidado: number | null = payload?.idConvidado ?? null;

  if (!nome || typeof nome !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const result = await query(
      "UPDATE presentes SET nome = $1, idConvidado = $2, data = CURRENT_DATE WHERE id = $3 RETURNING *",
      [nome.trim(), idConvidado, id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Presente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error("Erro ao atualizar presente", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Convidado já possui presente vinculado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao atualizar presente" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const result = await query("DELETE FROM presentes WHERE id = $1 RETURNING *", [id]);

    if (!result.rows.length) {
      return NextResponse.json({ error: "Presente não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao remover presente", error);
    return NextResponse.json({ error: "Erro ao remover presente" }, { status: 500 });
  }
}
