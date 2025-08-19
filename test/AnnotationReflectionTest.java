import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@interface CustomAnnotation {
    String value();
    int number();
}

public class AnnotationReflectionTest {
    @CustomAnnotation(value = "field", number = 10)
    private String annotatedField;
    
    @CustomAnnotation(value = "method", number = 20)
    public void annotatedMethod() {
        // Method implementation
    }
}