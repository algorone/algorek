package pl.com.algor.dss;

public class SignatureOperationException extends RuntimeException  {

    public SignatureOperationException(String message, Exception e) {
        super(message, e);
    }

}
