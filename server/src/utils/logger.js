import { createLogger, format, transports, config } from "winston";
const { combine, timestamp, json, colorize } = format;

const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return `${level}: ${message}`;
    })
);

const logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(colorize(), timestamp(), json()),
    transports: [
        new transports.Console({
            format: consoleLogFormat,
        }),
        new transports.File({ filename: "app.log" }),
        new transports.File({ filename: "app-error.log", level: "error" }),
    ],
});

export default logger;
