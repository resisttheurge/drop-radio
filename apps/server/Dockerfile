FROM docker.io/node:lts-alpine
LABEL org.opencontainers.image.source="https://github.com/resisttheurge/drop-radio"
LABEL org.opencontainers.image.description="Drop Radio Server Docker Image"

# install ffmpeg
RUN apk upgrade -U \ 
    && apk add ca-certificates ffmpeg libva-intel-driver \
    && rm -rf /var/cache/*

WORKDIR /app

RUN mkdir input \
    && mkdir output

COPY dist/main.js .

ENV HOST="0.0.0.0" 
ENV PORT=80 
ENV NODE_ENV="production"
ENV FILE_EXTENSION=mp3
ENV INPUT_DIRECTORY=/app/input 
ENV OUTPUT_DIRECTORY=/app/output
ENV START=2001-09-11T08:46:40-04:00

CMD [ "node", "main.js" ]
