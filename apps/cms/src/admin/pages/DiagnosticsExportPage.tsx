import * as React from "react";
import {
  Box,
  Button,
  Flex,
  SingleSelect,
  SingleSelectOption,
  TextInput,
  Typography,
} from "@strapi/design-system";
import { Download } from "@strapi/icons";
import { Layouts, Page, useFetchClient, useNotification } from "@strapi/strapi/admin";

interface CampaignOption {
  documentId: string;
  title: string;
  slug: string;
  isActive: boolean;
  organizationName: string;
  testLabel: string;
}

type ExportMode = "diagnostic" | "hr";

function readCookie(name: string) {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function getAdminToken() {
  const fromLocalStorage = window.localStorage.getItem("jwtToken");
  if (fromLocalStorage) {
    try {
      return JSON.parse(fromLocalStorage) as string;
    } catch {
      return null;
    }
  }

  return readCookie("jwtToken");
}

function extractErrorMessage(value: unknown) {
  if (typeof value === "string" && value.trim().length > 0) {
    try {
      return extractErrorMessage(JSON.parse(value));
    } catch {
      return value;
    }
  }

  if (typeof value !== "object" || value === null) {
    return "Не удалось выполнить запрос";
  }

  const record = value as Record<string, unknown>;
  const error = record.error;
  if (typeof error === "object" && error !== null) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  const message = record.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  return "Не удалось выполнить запрос";
}

function extractFileName(headerValue: string | null) {
  if (!headerValue) {
    return "diagnostic-submissions.csv";
  }

  const match = headerValue.match(/filename="([^"]+)"/i);
  return match?.[1] || "diagnostic-submissions.csv";
}

function triggerDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export default function DiagnosticsExportPage() {
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [exportMode, setExportMode] = React.useState<ExportMode>("diagnostic");
  const [campaigns, setCampaigns] = React.useState<CampaignOption[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = React.useState("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);
  const [loadError, setLoadError] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;

    const loadCampaigns = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await get("/diagnostic-tools/campaigns");
        const items = Array.isArray((response.data as { data?: unknown }).data)
          ? ((response.data as { data: CampaignOption[] }).data ?? [])
          : [];

        if (cancelled) {
          return;
        }

        setCampaigns(items);
        setSelectedCampaignId((current) => current || items[0]?.documentId || "");
      } catch (error) {
        if (cancelled) {
          return;
        }

        const message = extractErrorMessage(error);
        setLoadError(message);
        toggleNotification({
          type: "danger",
          message,
        });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadCampaigns();

    return () => {
      cancelled = true;
    };
  }, [get, toggleNotification]);

  const selectedCampaign =
    campaigns.find((item) => item.documentId === selectedCampaignId) ?? null;
  const isDiagnosticMode = exportMode === "diagnostic";
  const isExportDisabled = isExporting || (isDiagnosticMode && !selectedCampaignId);

  const handleExport = async () => {
    if (isExportDisabled) {
      return;
    }

    setIsExporting(true);

    try {
      const backendURL = (
        window as typeof window & { strapi: { backendURL: string } }
      ).strapi.backendURL;
      const params = new URLSearchParams();

      if (isDiagnosticMode) {
        params.set("campaign", selectedCampaignId);
      }

      if (from) {
        params.set("from", from);
      }

      if (to) {
        params.set("to", to);
      }

      const token = getAdminToken();
      const endpoint = isDiagnosticMode
        ? "/diagnostic-tools/export"
        : "/diagnostic-tools/hr-export";
      const queryString = params.toString();
      const response = await fetch(
        `${backendURL}${endpoint}${queryString ? `?${queryString}` : ""}`,
        {
          method: "GET",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(extractErrorMessage(errorText));
      }

      const blob = await response.blob();
      const fileName = extractFileName(response.headers.get("content-disposition"));
      triggerDownload(blob, fileName);

      toggleNotification({
        type: "success",
        message: "CSV выгрузка подготовлена",
      });
    } catch (error) {
      toggleNotification({
        type: "danger",
        message: extractErrorMessage(error),
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <Page.Loading />;
  }

  return (
    <Page.Main>
      <Page.Title>Настройки - Экспорт диагностики</Page.Title>
      <Layouts.Header
        title="Экспорт диагностики"
        subtitle="Скачивание CSV по типу опроса с опциональным диапазоном дат"
        primaryAction={
          <Button
            startIcon={<Download />}
            onClick={handleExport}
            disabled={isExportDisabled}
            loading={isExporting}
            size="S"
          >
            Скачать CSV
          </Button>
        }
      />
      <Layouts.Content>
        <Box
          background="neutral0"
          hasRadius
          shadow="filterShadow"
          paddingTop={7}
          paddingBottom={7}
          paddingLeft={7}
          paddingRight={7}
        >
          <Flex direction="column" alignItems="stretch" gap={6}>
            <div>
              <Typography variant="beta" tag="h1">
                Параметры выгрузки
              </Typography>
              <Typography textColor="neutral600">
                Выберите тип опроса и при необходимости ограничьте период по дате прохождения.
              </Typography>
            </div>

            {loadError ? (
              <Box
                borderColor="danger200"
                borderWidth="1px"
                hasRadius
                padding={4}
                background="danger100"
              >
                <Typography textColor="danger700">{loadError}</Typography>
              </Box>
            ) : null}

            <Flex direction="column" alignItems="stretch" gap={4}>
              <div>
                <Typography variant="omega" textColor="neutral700">
                  Тип выгрузки
                </Typography>
                <Box paddingTop={2}>
                  <SingleSelect
                    value={exportMode}
                    onChange={(value: string) =>
                      setExportMode(value === "hr" ? "hr" : "diagnostic")
                    }
                    placeholder="Выберите тип"
                  >
                    <SingleSelectOption value="diagnostic">
                      Обычная диагностика
                    </SingleSelectOption>
                    <SingleSelectOption value="hr">
                      HR-опрос
                    </SingleSelectOption>
                  </SingleSelect>
                </Box>
              </div>

              {isDiagnosticMode ? (
                <div>
                  <Typography variant="omega" textColor="neutral700">
                    Кампания
                  </Typography>
                  <Box paddingTop={2}>
                    <SingleSelect
                      value={selectedCampaignId}
                      onChange={(value: string) => setSelectedCampaignId(value)}
                      placeholder="Выберите кампанию"
                    >
                      {campaigns.map((campaign) => (
                        <SingleSelectOption key={campaign.documentId} value={campaign.documentId}>
                          {campaign.title} · {campaign.organizationName}
                        </SingleSelectOption>
                      ))}
                    </SingleSelect>
                  </Box>
                </div>
              ) : null}

              <Flex gap={4} alignItems="stretch" wrap="wrap">
                <Box minWidth="240px" flex="1">
                  <Typography variant="omega" textColor="neutral700">
                    Дата от
                  </Typography>
                  <Box paddingTop={2}>
                    <TextInput
                      type="date"
                      value={from}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setFrom(event.target.value)
                      }
                    />
                  </Box>
                </Box>

                <Box minWidth="240px" flex="1">
                  <Typography variant="omega" textColor="neutral700">
                    Дата до
                  </Typography>
                  <Box paddingTop={2}>
                    <TextInput
                      type="date"
                      value={to}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setTo(event.target.value)
                      }
                    />
                  </Box>
                </Box>
              </Flex>
            </Flex>

            {isDiagnosticMode && selectedCampaign ? (
              <Box
                borderColor="neutral200"
                borderWidth="1px"
                hasRadius
                padding={5}
                background="neutral100"
              >
                <Flex direction="column" alignItems="stretch" gap={2}>
                  <Typography variant="delta">{selectedCampaign.title}</Typography>
                  <Typography textColor="neutral600">
                    Организация: {selectedCampaign.organizationName}
                  </Typography>
                  <Typography textColor="neutral600">
                    Slug: {selectedCampaign.slug || "не задан"}
                  </Typography>
                  <Typography textColor="neutral600">
                    Тест: {selectedCampaign.testLabel}
                  </Typography>
                  <Typography textColor={selectedCampaign.isActive ? "success600" : "neutral600"}>
                    {selectedCampaign.isActive ? "Кампания активна" : "Кампания неактивна"}
                  </Typography>
                </Flex>
              </Box>
            ) : null}
          </Flex>
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
}
