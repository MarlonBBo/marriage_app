import { NextResponse } from "next/server";
import { getClient } from "@/lib/db";

export async function POST(req: Request) {
  const payload = await req.json();
  const nome: string | undefined = payload?.nome;
  const vai: boolean | undefined = payload?.vai;
  const acompanhantes: number = Number(payload?.acompanhantes ?? 0);
  const presentesIds: number[] = Array.isArray(payload?.presentesIds)
    ? payload.presentesIds
        .map((v: any) => Number(v))
        .filter((v: number) => Number.isInteger(v) && v > 0)
    : [];
  const presenteNome: string | null = payload?.presenteNome ?? null;

  if (!nome || typeof nome !== "string") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  if (typeof vai !== "boolean") {
    return NextResponse.json({ error: "Campo 'vai' deve ser booleano" }, { status: 400 });
  }

  if (Number.isNaN(acompanhantes) || acompanhantes < 0) {
    return NextResponse.json({ error: "Acompanhantes deve ser um número positivo" }, { status: 400 });
  }

  const client = await getClient();

  try {
    await client.query("BEGIN");

    const convidadoResult = await client.query(
      "INSERT INTO convidados (nome, vai, acompanhantes) VALUES ($1, $2, $3) RETURNING *",
      [nome.trim(), vai, acompanhantes]
    );

    const convidado = convidadoResult.rows[0];

    let presentesRegistrados: any[] = [];

    if (presentesIds.length) {
      const result = await client.query(
        "UPDATE presentes SET idConvidado = $1, data = CURRENT_DATE WHERE id = ANY($2) AND idConvidado IS NULL RETURNING *",
        [convidado.id, presentesIds]
      );

      if (result.rowCount !== presentesIds.length) {
        throw new Error("Algum presente já foi escolhido. Atualize a página e tente novamente.");
      }

      presentesRegistrados = result.rows;
    }

    let presenteCustom: any = null;
    if (presenteNome && typeof presenteNome === "string" && presenteNome.trim()) {
      const result = await client.query(
        "INSERT INTO presentes (nome, idConvidado, data) VALUES ($1, $2, CURRENT_DATE) RETURNING *",
        [presenteNome.trim(), convidado.id]
      );
      presenteCustom = result.rows[0];
    }

    await client.query("COMMIT");

    return NextResponse.json(
      { convidado, presentes: presentesRegistrados, presenteCustom },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Erro ao salvar RSVP", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Erro ao salvar RSVP";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
