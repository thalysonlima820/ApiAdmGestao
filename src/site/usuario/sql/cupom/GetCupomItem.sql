SELECT   m.numped, m.numseq, m.CODAUXILIAR,
         (SELECT descricao
            FROM pcprodut
           WHERE codprod = m.codprod) descricao, NVL (m.qtcont, 0) qtcont,
         NVL (m.punitcont, 0) punitcont
    FROM pcmov m
   WHERE numped = :numped
     AND dtcancel IS NULL
     AND NVL(m.tipoitem,'I') <> 'C'
     AND numtransvenda IS NOT NULL
ORDER BY numped, numseq 