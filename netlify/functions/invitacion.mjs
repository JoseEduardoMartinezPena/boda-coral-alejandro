import { invitaciones } from "../data/invitados.mjs";

export default async (request) => {
  const url = new URL(request.url);

  const token = url.searchParams.get("token")?.trim();

  if (!token) {
    return Response.json(
      {
        error: "Falta el identificador de invitación.",
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const invitacion = invitaciones[token];

  if (!invitacion) {
    return Response.json(
      {
        error: "Invitación no encontrada.",
      },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return Response.json(
    {
      id: invitacion.id,
      nombre: invitacion.nombre,
      pases: invitacion.pases,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
};

export const config = {
  path: "/api/invitacion",
};
