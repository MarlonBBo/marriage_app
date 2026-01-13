import { NextResponse } from "next/server";
import { getClient, query } from "@/lib/db";

type Params = { params: { id: string } };

const parseId = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
};

export async function GET(_req: Request, { params }: Params) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const result = await query("SELECT * FROM convidados WHERE id = $1", [id]);
    if (!result.rows.length) {
      return NextResponse.json({ error: "Convidado não encontrado" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar convidado", error);
    return NextResponse.json({ error: "Erro ao buscar convidado" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

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
      "UPDATE convidados SET nome = $1, vai = $2, acompanhantes = $3 WHERE id = $4 RETURNING *",
      [nome.trim(), vai, acompanhantes, id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Convidado não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar convidado", error);
    return NextResponse.json({ error: "Erro ao atualizar convidado" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = parseId(params.id);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const client = await getClient();

  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM presentes WHERE idConvidado = $1", [id]);
    const result = await client.query(
      "DELETE FROM convidados WHERE id = $1 RETURNING *",
      [id]
    );
    await client.query("COMMIT");

    if (!result.rows.length) {
      return NextResponse.json({ error: "Convidado não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao remover convidado", error);
    return NextResponse.json({ error: "Erro ao remover convidado" }, { status: 500 });
  } finally {
    client.release();
  }
}
