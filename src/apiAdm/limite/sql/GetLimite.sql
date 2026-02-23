WITH PEDIDO AS (
    SELECT
        PCPEDIDO.DTEMISSAO DATA,
        PCEMPR.NOME,
        PCPEDIDO.NUMPED,
        PCPEDIDO.CODFORNEC,
        PCFORNEC.FORNECEDOR,
        PCPEDIDO.VLTOTAL VLRGASTO,
        PCPEDIDO.CODCONTA,
        PCLANC3.RECNUM,
        PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
        PCLIMITECOMPRAPERIODO.CODFILIAL
    FROM
        PCLIMITECOMPRAPERIODO,
        PCEMPR,
        PCFORNEC,
        PCPEDIDO,
        PCLANC3
    WHERE
        NVL(PCLIMITECOMPRAPERIODO.VALORLIMITE, 0) >= 0
        AND 'P' = 'P'
        AND PCLIMITECOMPRAPERIODO.CODCOMPRADOR = PCEMPR.MATRICULA(+)
        AND PCFORNEC.CODFORNEC = PCPEDIDO.CODFORNEC
        AND PCPEDIDO.TIPOBONIFIC <> 'B'
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
            PCPEDIDO.CODCOMPRADOR
        ) = PCPEDIDO.CODCOMPRADOR
        AND PCPEDIDO.NUMPED = PCLANC3.NUMPED(+)
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODFILIAL,
            PCPEDIDO.CODFILIAL
        ) = PCPEDIDO.CODFILIAL
        AND PCPEDIDO.DTEMISSAO BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
        AND PCLIMITECOMPRAPERIODO.DATAFINAL
        AND (
            (
                (
                    :dataInicio BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
                OR (
                    :dataFim BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
            )
            OR (
                (
                    PCLIMITECOMPRAPERIODO.DATAINICIAL BETWEEN :dataInicio
                    AND :dataFim
                )
                OR (
                    PCLIMITECOMPRAPERIODO.DATAFINAL BETWEEN :dataFim
                    AND :dataFim
                )
            )
        )
    UNION
    SELECT
        PCLANC3.DTVENC DATA,
        PCEMPR.NOME,
        PCLANC3.NUMPED,
        PCLANC3.CODFORNEC,
        PCFORNEC.FORNECEDOR,
        PCLANC3.VALOR VLRGASTO,
        PCPEDIDO.CODCONTA,
        PCLANC3.RECNUM,
        PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
        PCLIMITECOMPRAPERIODO.CODFILIAL
    FROM
        PCLIMITECOMPRAPERIODO,
        PCEMPR,
        PCFORNEC,
        PCLANC3,
        PCPEDIDO
    WHERE
        NVL(PCLIMITECOMPRAPERIODO.VALORLIMITE, 0) >= 0
        AND 'P' = 'C'
        AND PCLIMITECOMPRAPERIODO.CODCOMPRADOR = PCEMPR.MATRICULA(+)
        AND PCFORNEC.CODFORNEC = PCLANC3.CODFORNEC
        AND PCPEDIDO.TIPOBONIFIC <> 'B'
        AND PCPEDIDO.NUMPED = PCLANC3.NUMPED
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
            PCPEDIDO.CODCOMPRADOR
        ) = PCPEDIDO.CODCOMPRADOR
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODFILIAL,
            PCLANC3.CODFILIAL
        ) = PCLANC3.CODFILIAL
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODFORNEC,
            PCLANC3.CODFORNEC
        ) = PCLANC3.CODFORNEC
        AND PCLANC3.DTVENC BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
        AND PCLIMITECOMPRAPERIODO.DATAFINAL
        AND (
            (
                (
                    :dataInicio BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
                OR (
                    :dataFim BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
            )
            OR (
                (
                    PCLIMITECOMPRAPERIODO.DATAINICIAL BETWEEN :dataInicio
                    AND :dataFim
                )
                OR (
                    PCLIMITECOMPRAPERIODO.DATAFINAL BETWEEN :dataFim
                    AND :dataFim
                )
            )
        )
    UNION
    SELECT
        PCLANC.DTVENC DATA,
        PCEMPR.NOME,
        (
            SELECT
                M.NUMPED
            FROM
                PCMOV M
            WHERE
                M.NUMTRANSENT = PCNFENT.NUMTRANSENT
                AND ROWNUM <= 1
        ) NUMPED,
        PCLANC.CODFORNEC,
        PCFORNEC.FORNECEDOR,
        PCLANC.VALOR VLRGASTO,
        PCLANC.CODCONTA,
        PCLANC.RECNUM,
        PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
        PCLIMITECOMPRAPERIODO.CODFILIAL
    FROM
        PCLIMITECOMPRAPERIODO,
        PCEMPR,
        PCFORNEC,
        PCLANC,
        PCCONSUM,
        PCNFENT
    WHERE
        NVL(PCLIMITECOMPRAPERIODO.VALORLIMITE, 0) >= 0
        AND NOT EXISTS(
            SELECT
                1
            FROM
                PCDESDLANC
            WHERE
                PCLANC.RECNUM = PCDESDLANC.RECNUMORIG
        )
        AND 'P' = 'C'
        AND PCLIMITECOMPRAPERIODO.CODCOMPRADOR = PCEMPR.MATRICULA(+)
        AND PCFORNEC.CODFORNEC = PCLANC.CODFORNEC
        AND (
            (
                PCLANC.CODCONTA IN(
                    PCCONSUM.CODCONTFOR,
                    PCCONSUM.CODCONTFRE,
                    PCCONSUM.CODCONTOUT
                )
            )
            OR (PCNFENT.TIPODESCARGA = 'S')
        )
        AND NVL(PCLANC.NUMTRANSENTNF, PCLANC.NUMTRANSENT) = PCNFENT.NUMTRANSENT
        AND PCNFENT.CODCONT = PCNFENT.CODCONTFOR
        AND PCNFENT.DTCANCEL IS NULL
        AND PCLANC.VALOR > 0
        AND PCLANC.DTESTORNOBAIXA IS NULL
        AND PCLANC.DTCANCEL IS NULL
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
            PCLANC.CODCOMPRADOR
        ) = PCLANC.CODCOMPRADOR
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODFILIAL,
            PCLANC.CODFILIAL
        ) = PCLANC.CODFILIAL
        AND NVL(
            PCLIMITECOMPRAPERIODO.CODFORNEC,
            PCLANC.CODFORNEC
        ) = PCLANC.CODFORNEC
        AND PCLANC.DTVENC BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
        AND PCLIMITECOMPRAPERIODO.DATAFINAL
        AND (
            (
                (
                    :dataInicio BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
                OR (
                    :dataFim BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
            )
            OR (
                (
                    PCLIMITECOMPRAPERIODO.DATAINICIAL BETWEEN :dataInicio
                    AND :dataFim
                )
                OR (
                    PCLIMITECOMPRAPERIODO.DATAFINAL BETWEEN :dataFim
                    AND :dataFim
                )
            )
        )
),
ENTREGUE AS (
    SELECT
        *
    FROM
        PCPEDNF
),
LIMITES AS (
    SELECT
        P.CODFILIAL,
        P.CODCOMPRADOR,
        P.NOME,
        SUM(
            CASE
                WHEN E.NUMPEDIDO IS NULL THEN P.VLRGASTO -- Se não existir no ENTREGUE
                ELSE 0
            END
        ) AS VALOR_NAO_ENTREGUE,
        SUM(
            CASE
                WHEN E.NUMPEDIDO IS NOT NULL THEN P.VLRGASTO -- Se existir no ENTREGUE
                ELSE 0
            END
        ) AS VALOR_ENTREGUE
    FROM
        PEDIDO P
        LEFT JOIN ENTREGUE E ON P.NUMPED = E.NUMPEDIDO
    GROUP BY
        P.CODFILIAL,
        P.CODCOMPRADOR,
        P.NOME
),
LIMITECOMPRAPERIODO AS (
    SELECT
        PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
        PCEMPR.NOME,
        PCLIMITECOMPRAPERIODO.DATAINICIAL,
        PCLIMITECOMPRAPERIODO.DATAFINAL,
        PCLIMITECOMPRAPERIODO.CODFORNEC,
        PCLIMITECOMPRAPERIODO.CODFILIAL,
        NVL(PCLIMITECOMPRAPERIODO.VALORLIMITE, 0) VALORLIMITE,
        (
            SELECT
                SUM(NVL(PCLANC.VALOR, 0)) VALOR
            FROM
                PCLANC,
                PCCONSUM,
                PCNFENT
            WHERE
                PCLANC.DTVENC BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                AND PCLIMITECOMPRAPERIODO.DATAFINAL
                AND (
                    (
                        PCLANC.CODCONTA IN(
                            PCCONSUM.CODCONTFOR,
                            PCCONSUM.CODCONTFRE,
                            PCCONSUM.CODCONTOUT
                        )
                    )
                    OR (PCNFENT.TIPODESCARGA = 'S')
                )
                AND NOT EXISTS(
                    SELECT
                        1
                    FROM
                        PCDESDLANC
                    WHERE
                        PCLANC.RECNUM = PCDESDLANC.RECNUMORIG
                )
                AND NVL(PCLANC.NUMTRANSENTNF, PCLANC.NUMTRANSENT) = PCNFENT.NUMTRANSENT
                AND PCNFENT.CODCONT = PCNFENT.CODCONTFOR
                AND PCNFENT.DTCANCEL IS NULL
                AND PCLANC.VALOR > 0
                AND PCLANC.DTESTORNOBAIXA IS NULL
                AND PCLANC.DTCANCEL IS NULL
                AND NVL(
                    PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
                    PCLANC.CODCOMPRADOR
                ) = PCLANC.CODCOMPRADOR
                AND NVL(
                    PCLIMITECOMPRAPERIODO.CODFILIAL,
                    PCLANC.CODFILIAL
                ) = PCLANC.CODFILIAL
                AND NVL(
                    PCLIMITECOMPRAPERIODO.CODFORNEC,
                    PCLANC.CODFORNEC
                ) = PCLANC.CODFORNEC
        ) VLPCLANC,
        (
            SELECT
                SUM(NVL(PCLANC3.VALOR, 0)) VALOR
            FROM
                PCPEDIDO,
                PCLANC3
            WHERE
                PCPEDIDO.NUMPED = PCLANC3.NUMPED
                AND PCLANC3.DTVENC BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                AND PCLIMITECOMPRAPERIODO.DATAFINAL
                AND PCPEDIDO.TIPOBONIFIC <> 'B'
                AND NVL(
                    PCLIMITECOMPRAPERIODO.CODCOMPRADOR,
                    PCPEDIDO.CODCOMPRADOR
                ) = PCPEDIDO.CODCOMPRADOR
                AND NVL(
                    PCLIMITECOMPRAPERIODO.CODFILIAL,
                    PCLANC3.CODFILIAL
                ) = PCLANC3.CODFILIAL
                AND NVL(
                    PCLIMITECOMPRAPERIODO.CODFORNEC,
                    PCLANC3.CODFORNEC
                ) = PCLANC3.CODFORNEC
        ) VLPCLANC3,
        PCLIMITECOMPRAPERIODO.ROWID ID,
        NVL(
            (
                SELECT
                    SUM(NVL(VLTOTAL, 0))
                FROM
                    PCPEDIDO
                WHERE
                    PCPEDIDO.DTEMISSAO BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                    AND PCPEDIDO.TIPOBONIFIC <> 'B'
                    AND NVL(
                        PCLIMITECOMPRAPERIODO.CODFILIAL,
                        PCPEDIDO.CODFILIAL
                    ) = PCPEDIDO.CODFILIAL
                    AND NVL(
                        PCLIMITECOMPRAPERIODO.CODFORNEC,
                        PCPEDIDO.CODFORNEC
                    ) = PCPEDIDO.CODFORNEC
                    AND DECODE(
                        NVL(PCLIMITECOMPRAPERIODO.CODCOMPRADOR, 0),
                        0,
                        PCPEDIDO.CODCOMPRADOR,
                        PCLIMITECOMPRAPERIODO.CODCOMPRADOR
                    ) = PCPEDIDO.CODCOMPRADOR
            ),
            0
        ) VLPEDIDOS
    FROM
        PCLIMITECOMPRAPERIODO,
        PCEMPR
    WHERE
        PCLIMITECOMPRAPERIODO.CODCOMPRADOR = PCEMPR.MATRICULA(+)
        AND (
            (
                (
                    :dataInicio BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
                OR (
                    :dataFim BETWEEN PCLIMITECOMPRAPERIODO.DATAINICIAL
                    AND PCLIMITECOMPRAPERIODO.DATAFINAL
                )
            )
            OR (
                (
                    PCLIMITECOMPRAPERIODO.DATAINICIAL BETWEEN :dataInicio
                    AND :dataFim
                )
                OR (
                    PCLIMITECOMPRAPERIODO.DATAFINAL BETWEEN :dataInicio
                    AND :dataFim
                )
            )
        )
),
LIMITEATUAL AS (
    SELECT
        LIMITECOMPRAPERIODO.CODCOMPRADOR,
        LIMITECOMPRAPERIODO.DATAINICIAL,
        LIMITECOMPRAPERIODO.DATAFINAL,
        LIMITECOMPRAPERIODO.NOME,
        LIMITECOMPRAPERIODO.CODFILIAL,
        (LIMITECOMPRAPERIODO.VALORLIMITE) AS TOTAL_VALORLIMITE,
        LIMITECOMPRAPERIODO.VLPEDIDOS VLRGASTO,
        LIMITECOMPRAPERIODO.VALORLIMITE - LIMITECOMPRAPERIODO.VLPEDIDOS VLRSALDO
    FROM
        LIMITECOMPRAPERIODO
)
SELECT
    LTT.DATAINICIAL,
    LTT.DATAFINAL,
    LTT.CODFILIAL,
    LTT.CODCOMPRADOR,
    LTT.NOME,
    COALESCE(L.VALOR_ENTREGUE, 0) AS VALOR_ENTREGUE,
    COALESCE(L.VALOR_NAO_ENTREGUE, 0) AS VALOR_NAO_ENTREGUE,
    LTT.TOTAL_VALORLIMITE,
    LTT.VLRGASTO,
    LTT.VLRSALDO
FROM
    LIMITES L FULL
    OUTER JOIN LIMITEATUAL LTT ON L.CODCOMPRADOR = LTT.CODCOMPRADOR
    AND (
      L.CODFILIAL = LTT.CODFILIAL
   	  OR (L.CODFILIAL IS NULL AND LTT.CODFILIAL IS NULL)
	)
    WHERE LTT.NOME IS NOT NULL
ORDER BY
    LTT.DATAFINAL,
    L.NOME,
    L.CODFILIAL